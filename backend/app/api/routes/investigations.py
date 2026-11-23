import uuid

from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession, QAApprover
from app.schemas.investigation import (
    ApprovalRequest,
    InvestigationCreate,
    InvestigationDetail,
    InvestigationSummary,
    InvestigationUpdate,
)
from app.services import approval_service, investigation_service

router = APIRouter()


def _detail(db, inv) -> InvestigationDetail:
    detail = InvestigationDetail.model_validate(inv)
    detail.capa_actions = investigation_service.capa_actions(db, inv)
    return detail


@router.post("", response_model=InvestigationDetail, status_code=status.HTTP_201_CREATED)
def create_investigation(data: InvestigationCreate, db: DbSession, user: CurrentUser):
    return _detail(db, investigation_service.create(db, data, user))


@router.get("", response_model=list[InvestigationSummary])
def list_investigations(db: DbSession, _: CurrentUser):
    return investigation_service.list_all(db)


@router.get("/{investigation_id}", response_model=InvestigationDetail)
def get_investigation(investigation_id: uuid.UUID, db: DbSession, _: CurrentUser):
    return _detail(db, investigation_service.get(db, investigation_id))


@router.patch("/{investigation_id}", response_model=InvestigationDetail)
def update_investigation(
    investigation_id: uuid.UUID, data: InvestigationUpdate, db: DbSession, user: CurrentUser
):
    return _detail(db, investigation_service.update(db, investigation_id, data, user))


@router.post("/{investigation_id}/approve", response_model=InvestigationDetail)
def approve_investigation(
    investigation_id: uuid.UUID, body: ApprovalRequest, db: DbSession, user: QAApprover
):
    return _detail(db, approval_service.approve(db, investigation_id, user, body.comment))
