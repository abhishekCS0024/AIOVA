import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.enums import CapaStatus, ChangeSource
from app.models.base import Base, Timestamps, UUIDPrimaryKey


class CapaAction(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "capa_actions"

    # Rule 6: NOT NULL — an action without a root cause cannot be saved.
    root_cause_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("root_causes.id", ondelete="CASCADE"), index=True
    )
    type: Mapped[str] = mapped_column(String(16))  # CapaType
    action: Mapped[str] = mapped_column(Text)
    rationale: Mapped[str | None] = mapped_column(Text)
    owner: Mapped[str | None] = mapped_column(String(120))
    due_date: Mapped[date | None] = mapped_column(Date)
    effectiveness_check: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(16), default=CapaStatus.PROPOSED)
    source: Mapped[str] = mapped_column(String(8), default=ChangeSource.AI)

    root_cause = relationship("RootCause", back_populates="capa_actions")
