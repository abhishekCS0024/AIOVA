"""Step 5 — Rank causes: ranked root causes + contributing factors with evidence."""

from app.ai.nodes._utils import as_json, mark_done
from app.ai.schemas import RankedCauses
from app.ai.state import RCAState
from app.ai.structured import invoke_structured

CONFIDENCE_ORDER = {"high": 0, "medium": 1, "low": 2}


def rank_causes(state: RCAState) -> dict:
    result = invoke_structured(
        "rank_causes",
        RankedCauses,
        analysis=as_json({"five_whys": state.get("five_whys"), "fishbone": state.get("fishbone")}),
        documents=state["cleaned_text"],
    )
    causes = []
    for cause in result.model_dump(mode="json")["causes"]:
        # Unsupported causes are forced to low confidence (docs §7.2).
        if not any(ref["supports"] for ref in cause["evidence_refs"]):
            cause["confidence"] = "low"
        causes.append({**cause, "status": "suggested"})
    # Deterministic order: root causes before contributing factors, then by confidence.
    causes.sort(key=lambda c: (c["type"] != "root_cause", CONFIDENCE_ORDER[c["confidence"]]))
    return {"causes": causes, "completed_steps": mark_done(state, "causes")}
