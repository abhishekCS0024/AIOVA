"""Step 3 — Gap check: list missing information, why it matters, and priority."""

from app.ai.nodes._utils import as_json, mark_done
from app.ai.schemas import GapReport
from app.ai.state import RCAState
from app.ai.structured import invoke_structured


def gap_check(state: RCAState) -> dict:
    result = invoke_structured(
        "gap_check",
        GapReport,
        fields=as_json(state.get("extracted_fields")),
        documents=state["cleaned_text"],
    )
    return {
        "gaps": [g.model_dump(mode="json") for g in result.gaps],
        "completed_steps": mark_done(state, "gaps"),
    }
