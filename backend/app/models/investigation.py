import uuid

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.enums import InvestigationStatus
from app.models.base import Base, Timestamps, UUIDPrimaryKey


class Investigation(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "investigations"

    deviation_no: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    title: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(32), default=InvestigationStatus.DRAFT, index=True)
    severity: Mapped[str | None] = mapped_column(String(16))
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    # What the human kept (editable) vs. the untouched AI output (never overwritten, rule 7).
    form_data: Mapped[dict] = mapped_column(JSONB, default=dict)
    ai_draft: Mapped[dict] = mapped_column(JSONB, default=dict)
    five_whys: Mapped[list] = mapped_column(JSONB, default=list)
    fishbone: Mapped[dict] = mapped_column(JSONB, default=dict)
    missing_evidence: Mapped[list] = mapped_column(JSONB, default=list)

    # LangGraph thread used for checkpoints / human-review interrupt.
    graph_thread_id: Mapped[str | None] = mapped_column(String(64))
    version: Mapped[int] = mapped_column(Integer, default=1)

    owner = relationship("User")
    documents = relationship(
        "SourceDocument", back_populates="investigation", cascade="all, delete-orphan",
        order_by="SourceDocument.created_at",
    )
    root_causes = relationship(
        "RootCause", back_populates="investigation", cascade="all, delete-orphan",
        order_by="RootCause.rank",
    )
    audit_entries = relationship("AuditLog", back_populates="investigation")
