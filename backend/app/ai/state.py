"""Shared LangGraph state for the RCA pipeline."""

from typing import Literal, TypedDict


class SourceInput(TypedDict):
    document: str  # filename or label
    source_type: str
    text: str


class RCAState(TypedDict, total=False):
    investigation_id: str
    sources: list[SourceInput]

    # Ingest
    cleaned_text: str
    sections: list[dict]

    # AI outputs (each validated against app.ai.schemas)
    extracted_fields: dict
    gaps: list[dict]
    five_whys: list[dict]
    fishbone: dict
    causes: list[dict]
    capa: list[dict]

    # Human review
    review_decision: Literal["approve", "rerun"]
    user_edits: dict

    completed_steps: list[str]
    errors: list[str]
