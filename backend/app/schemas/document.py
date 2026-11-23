import uuid
from datetime import datetime

from pydantic import BaseModel

from app.domain.enums import SourceType
from app.schemas.common import ORMModel


class PastedTextIn(BaseModel):
    text: str
    title: str | None = None


class DocumentRead(ORMModel):
    id: uuid.UUID
    type: SourceType
    filename: str | None
    extracted_text: str
    created_at: datetime
