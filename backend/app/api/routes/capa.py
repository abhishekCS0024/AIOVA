import uuid

from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.capa import CapaRead, CapaUpdate
from app.services import capa_service

router = APIRouter()


@router.patch("/{capa_id}", response_model=CapaRead)
def update_capa(capa_id: uuid.UUID, data: CapaUpdate, db: DbSession, user: CurrentUser):
    return capa_service.update(db, capa_id, data, user)
