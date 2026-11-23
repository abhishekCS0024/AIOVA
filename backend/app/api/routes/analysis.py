import uuid

from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.domain.enums import PipelineStep
from app.schemas.analysis import AnalysisRunResponse, AskAIRequest, AskAIResponse
from app.services import analysis_service

router = APIRouter()


@router.post("/{investigation_id}/analyze", response_model=AnalysisRunResponse)
def run_analysis(investigation_id: uuid.UUID, db: DbSession, _: CurrentUser):
    """Run the full AI pipeline. Stops at the human-review interrupt."""
    result = analysis_service.run_full(db, investigation_id)
    return AnalysisRunResponse(investigation_id=str(investigation_id), **result)


@router.post("/{investigation_id}/analyze/{step}", response_model=AnalysisRunResponse)
def rerun_step(investigation_id: uuid.UUID, step: PipelineStep, db: DbSession, _: CurrentUser):
    """Re-run one step, e.g. `capa` after editing causes."""
    result = analysis_service.run_step(db, investigation_id, step)
    return AnalysisRunResponse(investigation_id=str(investigation_id), **result)


@router.post("/{investigation_id}/ask", response_model=AskAIResponse)
def ask_ai(investigation_id: uuid.UUID, body: AskAIRequest, db: DbSession, _: CurrentUser):
    """AI panel Q&A, e.g. "Why is rc-1 medium confidence?" (docs §10.1)."""
    # TODO: answer grounded in the investigation's documents and current draft.
    raise NotImplementedError
