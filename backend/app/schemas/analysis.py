from pydantic import BaseModel


class AnalysisRunResponse(BaseModel):
    """Result of running (or re-running) the AI pipeline.

    The pipeline always stops at the human-review interrupt (rule 4), so
    `awaiting_review` is True whenever a draft was produced.
    """

    investigation_id: str
    thread_id: str
    completed_steps: list[str]  # graph node steps, incl. ingest/save
    awaiting_review: bool
    draft: dict


class AskAIRequest(BaseModel):
    question: str


class AskAIResponse(BaseModel):
    answer: str
