import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.domain.enums import InvestigationStatus, Severity
from app.schemas.capa import CapaRead
from app.schemas.common import ORMModel
from app.schemas.document import DocumentRead
from app.schemas.root_cause import RootCauseRead


class InvestigationCreate(BaseModel):
    deviation_no: str
    title: str | None = None


class InvestigationUpdate(BaseModel):
    """User edits to form fields. Each changed key produces an audit entry."""

    form_data: dict | None = None
    severity: Severity | None = None
    five_whys: list | None = None
    fishbone: dict | None = None
    status: InvestigationStatus | None = None


class InvestigationSummary(ORMModel):
    id: uuid.UUID
    deviation_no: str
    title: str | None
    status: InvestigationStatus
    severity: Severity | None
    version: int
    created_at: datetime
    updated_at: datetime


class InvestigationDetail(InvestigationSummary):
    form_data: dict
    ai_draft: dict
    five_whys: list
    fishbone: dict
    missing_evidence: list
    documents: list[DocumentRead] = Field(default_factory=list)
    root_causes: list[RootCauseRead] = Field(default_factory=list)
    capa_actions: list[CapaRead] = Field(default_factory=list)


class ApprovalRequest(BaseModel):
    comment: str | None = None
