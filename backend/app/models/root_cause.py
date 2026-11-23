import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.enums import CauseType, ChangeSource, RootCauseStatus
from app.models.base import Base, Timestamps, UUIDPrimaryKey


class RootCause(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "root_causes"

    investigation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("investigations.id", ondelete="CASCADE"), index=True
    )
    type: Mapped[str] = mapped_column(String(32), default=CauseType.ROOT_CAUSE)
    rank: Mapped[int | None] = mapped_column(Integer)
    category: Mapped[str] = mapped_column(String(32))  # FishboneCategory
    description: Mapped[str] = mapped_column(Text)
    confidence: Mapped[str] = mapped_column(String(16))
    evidence_refs: Mapped[list] = mapped_column(JSONB, default=list)
    missing_evidence: Mapped[list] = mapped_column(JSONB, default=list)

    # Rule 1: every AI cause starts as `suggested`.
    status: Mapped[str] = mapped_column(String(16), default=RootCauseStatus.SUGGESTED)
    source: Mapped[str] = mapped_column(String(8), default=ChangeSource.AI)
    confirmed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    investigation = relationship("Investigation", back_populates="root_causes")
    capa_actions = relationship(
        "CapaAction", back_populates="root_cause", cascade="all, delete-orphan"
    )
