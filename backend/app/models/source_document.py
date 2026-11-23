import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, Timestamps, UUIDPrimaryKey


class SourceDocument(UUIDPrimaryKey, Timestamps, Base):
    __tablename__ = "source_documents"

    investigation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("investigations.id", ondelete="CASCADE"), index=True
    )
    type: Mapped[str] = mapped_column(String(16))  # SourceType
    filename: Mapped[str | None] = mapped_column(String(255))
    storage_path: Mapped[str | None] = mapped_column(String(512))
    extracted_text: Mapped[str] = mapped_column(Text, default="")
    doc_metadata: Mapped[dict] = mapped_column(JSONB, default=dict)

    investigation = relationship("Investigation", back_populates="documents")
