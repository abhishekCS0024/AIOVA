"""Step 4 — Analyze: 5 Whys chain and 6M fishbone."""

from app.ai.nodes._utils import as_json, mark_done
from app.ai.schemas import Analysis
from app.ai.state import RCAState
from app.ai.structured import invoke_structured
from app.domain.enums import FishboneCategory


def analyze(state: RCAState) -> dict:
    result = invoke_structured(
        "analyze",
        Analysis,
        fields=as_json(state.get("extracted_fields")),
        user_edits=as_json(state.get("user_edits", {})),
        documents=state["cleaned_text"],
    )
    data = result.model_dump(mode="json")
    fishbone: dict[str, list[dict]] = {c.value: [] for c in FishboneCategory}
    for cause in data["fishbone"]:
        fishbone[cause.pop("category")].append(cause)
    return {
        "five_whys": data["five_whys"],
        "fishbone": fishbone,
        "completed_steps": mark_done(state, "analyze"),
    }
