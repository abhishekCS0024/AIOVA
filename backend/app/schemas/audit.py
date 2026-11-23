import uuid
from datetime import datetime
from typing import Any

from app.domain.enums import ChangeSource
from app.schemas.common import ORMModel


class AuditEntryRead(ORMModel):
    id: uuid.UUID
    user_id: uuid.UUID | None
    action: str
    entity: str | None
    entity_id: uuid.UUID | None
    field: str | None
    old_value: Any
    new_value: Any
    source: ChangeSource
    at: datetime
