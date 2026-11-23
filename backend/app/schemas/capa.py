import uuid
from datetime import date

from pydantic import BaseModel

from app.domain.enums import CapaStatus, CapaType, ChangeSource
from app.schemas.common import ORMModel


class CapaRead(ORMModel):
    id: uuid.UUID
    root_cause_id: uuid.UUID
    type: CapaType
    action: str
    rationale: str | None
    owner: str | None
    due_date: date | None
    effectiveness_check: str | None
    status: CapaStatus
    source: ChangeSource


class CapaUpdate(BaseModel):
    action: str | None = None
    rationale: str | None = None
    owner: str | None = None
    due_date: date | None = None
    effectiveness_check: str | None = None
    status: CapaStatus | None = None
    root_cause_id: uuid.UUID | None = None
