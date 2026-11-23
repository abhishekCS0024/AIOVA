import uuid

from pydantic import BaseModel

from app.domain.enums import CauseType, ChangeSource, Confidence, FishboneCategory, RootCauseStatus
from app.schemas.common import EvidenceRef, ORMModel


class RootCauseRead(ORMModel):
    id: uuid.UUID
    type: CauseType
    rank: int | None
    category: FishboneCategory
    description: str
    confidence: Confidence
    evidence_refs: list[EvidenceRef]
    missing_evidence: list[str]
    status: RootCauseStatus
    source: ChangeSource
    confirmed_by: uuid.UUID | None


class RootCauseUpdate(BaseModel):
    """Edit, confirm or reject a root cause. Confirmation is rule-checked server-side."""

    description: str | None = None
    category: FishboneCategory | None = None
    confidence: Confidence | None = None
    evidence_refs: list[EvidenceRef] | None = None
    status: RootCauseStatus | None = None
