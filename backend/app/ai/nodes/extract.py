"""Step 2 — Extract: populate RCA form fields from the documents."""

from app.ai.nodes._utils import mark_done
from app.ai.schemas import ExtractedFields
from app.ai.state import RCAState
from app.ai.structured import invoke_structured


def extract(state: RCAState) -> dict:
    result = invoke_structured("extract", ExtractedFields, documents=state["cleaned_text"])
    return {
        "extracted_fields": result.model_dump(mode="json"),
        "completed_steps": mark_done(state, "extract"),
    }
