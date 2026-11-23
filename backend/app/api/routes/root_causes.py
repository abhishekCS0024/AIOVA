import uuid

from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.root_cause import RootCauseRead, RootCauseUpdate
from app.services import root_cause_service

router = APIRouter()


@router.patch("/{root_cause_id}", response_model=RootCauseRead)
def update_root_cause(
    root_cause_id: uuid.UUID, data: RootCauseUpdate, db: DbSession, user: CurrentUser
):
    """Edit, confirm or reject. Confirming requires evidence + qa_approver (rules 2, 3)."""
    return root_cause_service.update(db, root_cause_id, data, user)
