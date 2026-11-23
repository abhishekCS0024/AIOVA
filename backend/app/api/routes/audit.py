import uuid

from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.audit import AuditEntryRead
from app.services import audit_service, investigation_service

router = APIRouter()


@router.get("/{investigation_id}/audit", response_model=list[AuditEntryRead])
def get_audit_trail(investigation_id: uuid.UUID, db: DbSession, _: CurrentUser):
    investigation_service.get(db, investigation_id)
    return audit_service.list_for_investigation(db, investigation_id)
