import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDPrimaryKey


class AuditLog(UUIDPrimaryKey, Base):
    """Append-only audit trail (rule 5). Never update or delete rows."""

    __tablename__ = "audit_log"

    investigation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("investigations.id"), index=True
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(64))  # e.g. field_edit, cause_confirmed, approved
    entity: Mapped[str | None] = mapped_column(String(32))  # investigation | root_cause | capa
    entity_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    field: Mapped[str | None] = mapped_column(String(128))
    old_value: Mapped[dict | list | str | None] = mapped_column(JSONB)
    new_value: Mapped[dict | list | str | None] = mapped_column(JSONB)
    source: Mapped[str] = mapped_column(String(8))  # ChangeSource: ai | user
    at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    investigation = relationship("Investigation", back_populates="audit_entries")
