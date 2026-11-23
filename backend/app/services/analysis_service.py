"""Runs the LangGraph pipeline and maps its draft onto the investigation.

The graph always stops at the human-review interrupt (rule 4). AI output is
written to `ai_draft` (never overwritten later, rule 7) and copied into the
editable fields, root causes (status `suggested`, rule 1) and proposed CAPA.
"""

import uuid
from collections.abc import Callable
from datetime import date, timedelta
from typing import TypeVar

from groq import APIError, RateLimitError
from langgraph.types import Command
from sqlalchemy.orm import Session

from app.ai.checkpointer import get_checkpointer
from app.ai.graph import STEP_NODES, build_graph
from app.ai.nodes import ingest
from app.ai.structured import StructuredOutputError
from app.core.exceptions import AIServiceError, ComplianceRuleViolation
from app.domain import rules
from app.domain.enums import ChangeSource, PipelineStep
from app.models import CapaAction, Investigation, RootCause
from app.services import audit_service, investigation_service

R = TypeVar("R")


def _call_ai(fn: Callable[[], R]) -> R:
    """Run an AI call, turning provider failures into a clean 503."""
    try:
        return fn()
    except RateLimitError as exc:
        raise AIServiceError("AI rate limit reached. Try again in a minute.") from exc
    except StructuredOutputError as exc:
        raise AIServiceError(f"AI returned unusable output ({exc}). Try re-running.") from exc
    except APIError as exc:
        raise AIServiceError(f"AI service error: {exc.message}") from exc


def _graph():
    return build_graph(checkpointer=get_checkpointer())


def _config(inv: Investigation) -> dict:
    return {"configurable": {"thread_id": inv.graph_thread_id}}


def _sources(inv: Investigation) -> list[dict]:
    return [
        {"document": d.filename or str(d.id), "source_type": d.type, "text": d.extracted_text}
        for d in inv.documents
    ]


def run_full(db: Session, investigation_id: uuid.UUID) -> dict:
    inv = investigation_service.get(db, investigation_id)
    rules.ensure_editable(inv.status)
    if not inv.documents:
        raise ComplianceRuleViolation("Add at least one document before running the analysis")

    inv.graph_thread_id = inv.graph_thread_id or str(uuid.uuid4())
    result = _call_ai(
        lambda: _graph().invoke(
            {"investigation_id": str(inv.id), "sources": _sources(inv)}, _config(inv)
        )
    )
    draft = result.get("__interrupt__")[0].value if result.get("__interrupt__") else result
    _apply_draft(db, inv, draft)
    return {
        "thread_id": inv.graph_thread_id,
        "completed_steps": result.get("completed_steps", []),
        "awaiting_review": bool(result.get("__interrupt__")),
        "draft": draft,
    }


def run_step(db: Session, investigation_id: uuid.UUID, step: PipelineStep) -> dict:
    """Re-run one AI step against the current (human-edited) state."""
    inv = investigation_service.get(db, investigation_id)
    state = {
        **ingest({"sources": _sources(inv)}),
        "extracted_fields": inv.form_data,
        "five_whys": inv.five_whys,
        "fishbone": inv.fishbone,
        "causes": [_cause_to_state(rc) for rc in inv.root_causes],
    }
    output = _call_ai(lambda: STEP_NODES[step](state))
    # TODO: merge `output` into the investigation (respecting user edits) and audit as `ai`.
    return {
        "thread_id": inv.graph_thread_id or "",
        "completed_steps": output.get("completed_steps", []),
        "awaiting_review": True,
        "draft": output,
    }


def resume(inv: Investigation, decision: str, edits: dict | None = None) -> dict:
    if not inv.graph_thread_id:
        return {}
    return _graph().invoke(
        Command(resume={"decision": decision, "edits": edits or {}}), _config(inv)
    )


def _cause_to_state(rc: RootCause) -> dict:
    return {
        "id": str(rc.id),
        "type": rc.type,
        "category": rc.category,
        "description": rc.description,
        "confidence": rc.confidence,
        "evidence_refs": rc.evidence_refs,
        "status": rc.status,
    }


def _apply_draft(db: Session, inv: Investigation, draft: dict) -> None:
    inv.ai_draft = draft  # untouched AI output for AI-vs-final comparison
    inv.form_data = draft.get("extracted_fields") or {}
    inv.title = inv.title or inv.form_data.get("deviation_title")
    inv.severity = inv.form_data.get("proposed_severity")
    inv.five_whys = draft.get("five_whys") or []
    inv.fishbone = draft.get("fishbone") or {}
    inv.missing_evidence = draft.get("gaps") or []

    # Replace previous AI suggestions; keep anything a human confirmed or created.
    for rc in list(inv.root_causes):
        if rc.source == ChangeSource.AI and rc.status == "suggested":
            inv.root_causes.remove(rc)

    by_ai_id: dict[str, RootCause] = {}
    for rank, cause in enumerate(draft.get("causes") or [], start=1):
        rc = RootCause(
            type=cause["type"], rank=rank, category=cause["category"],
            description=cause["description"], confidence=cause["confidence"],
            evidence_refs=cause["evidence_refs"], missing_evidence=cause["missing_evidence"],
        )
        inv.root_causes.append(rc)
        by_ai_id[cause["id"]] = rc

    for action in draft.get("capa") or []:
        rc = by_ai_id.get(action["cause_id"])
        if rc is None:
            continue
        due = action.get("due_in_days")
        rc.capa_actions.append(
            CapaAction(
                type=action["type"], action=action["action"], rationale=action["rationale"],
                owner=action.get("owner_role"), effectiveness_check=action.get("effectiveness_check"),
                due_date=date.today() + timedelta(days=due) if due else None,
            )
        )

    db.flush()
    audit_service.record(
        db, investigation_id=inv.id, action="ai_draft_generated", entity="investigation",
        entity_id=inv.id, new_value={"causes": len(by_ai_id)}, source=ChangeSource.AI,
    )
