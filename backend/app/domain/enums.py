"""Domain vocabulary: roles, statuses, categories (docs §2, §8)."""

from enum import StrEnum


class Role(StrEnum):
    INVESTIGATOR = "investigator"
    QA_APPROVER = "qa_approver"


class Severity(StrEnum):
    CRITICAL = "critical"
    MAJOR = "major"
    MINOR = "minor"


class InvestigationStatus(StrEnum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    CLOSED = "closed"


class CauseType(StrEnum):
    ROOT_CAUSE = "root_cause"
    CONTRIBUTING_FACTOR = "contributing_factor"


class RootCauseStatus(StrEnum):
    SUGGESTED = "suggested"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"


class FishboneCategory(StrEnum):
    """The 6M categories of an Ishikawa diagram."""

    MAN = "Man"
    MACHINE = "Machine"
    METHOD = "Method"
    MATERIAL = "Material"
    MEASUREMENT = "Measurement"
    MOTHER_NATURE = "Mother Nature"


class Confidence(StrEnum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class CapaType(StrEnum):
    CORRECTIVE = "corrective"
    PREVENTIVE = "preventive"


class CapaStatus(StrEnum):
    PROPOSED = "proposed"
    ACCEPTED = "accepted"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    VERIFIED = "verified"


class SourceType(StrEnum):
    PDF = "pdf"
    TEXT = "text"
    EMAIL = "email"


class ChangeSource(StrEnum):
    AI = "ai"
    USER = "user"


class GapPriority(StrEnum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class PipelineStep(StrEnum):
    """Re-runnable AI steps (POST /investigations/{id}/analyze/{step})."""

    EXTRACT = "extract"
    GAPS = "gaps"
    ANALYZE = "analyze"
    CAUSES = "causes"
    CAPA = "capa"
