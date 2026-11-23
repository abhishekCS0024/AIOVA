"""Pydantic models every AI step's JSON output is validated against (docs §7)."""

from pydantic import BaseModel, Field

from app.domain.enums import (
    CapaType,
    CauseType,
    Confidence,
    FishboneCategory,
    GapPriority,
    Severity,
)
from app.schemas.common import EvidenceRef


class DocumentSection(BaseModel):
    document: str
    heading: str | None = None
    text: str


class ExtractedFields(BaseModel):
    """Values not found in the documents must be null (never invented)."""

    deviation_title: str | None = None
    deviation_date: str | None = None
    product: str | None = None
    batch_no: str | None = None
    equipment_id: str | None = None
    process_step: str | None = None
    description: str | None = None
    immediate_actions: str | None = None
    proposed_severity: Severity | None = None


class Gap(BaseModel):
    item: str
    why_it_matters: str
    priority: GapPriority


class GapReport(BaseModel):
    gaps: list[Gap] = Field(default_factory=list)


class WhyStep(BaseModel):
    level: int
    question: str
    answer: str
    evidence_refs: list[EvidenceRef] = Field(default_factory=list)


class FishboneCause(BaseModel):
    category: FishboneCategory
    description: str
    evidence_refs: list[EvidenceRef] = Field(default_factory=list)


class Analysis(BaseModel):
    """Fishbone is a flat list (one item per cause) — the model nests brackets
    wrongly when asked for a category-keyed object; the node groups it after."""

    five_whys: list[WhyStep]
    fishbone: list[FishboneCause]


class CauseSuggestion(BaseModel):
    id: str
    type: CauseType
    category: FishboneCategory
    description: str
    confidence: Confidence
    evidence_refs: list[EvidenceRef] = Field(default_factory=list)
    missing_evidence: list[str] = Field(default_factory=list)


class RankedCauses(BaseModel):
    causes: list[CauseSuggestion]


class CapaSuggestion(BaseModel):
    cause_id: str
    type: CapaType
    action: str
    rationale: str
    owner_role: str | None = None
    due_in_days: int | None = None
    effectiveness_check: str | None = None


class CapaPlan(BaseModel):
    actions: list[CapaSuggestion]
