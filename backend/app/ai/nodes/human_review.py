"""Step 7 — Human review: pause the graph until a person approves or edits (rule 4)."""

from langgraph.types import interrupt

from app.ai.state import RCAState


def human_review(state: RCAState) -> dict:
    decision = interrupt(
        {
            "extracted_fields": state.get("extracted_fields"),
            "gaps": state.get("gaps"),
            "five_whys": state.get("five_whys"),
            "fishbone": state.get("fishbone"),
            "causes": state.get("causes"),
            "capa": state.get("capa"),
        }
    )
    # Resumed with Command(resume={"decision": "approve" | "rerun", "edits": {...}})
    return {
        "review_decision": decision.get("decision", "rerun"),
        "user_edits": decision.get("edits", {}),
    }
