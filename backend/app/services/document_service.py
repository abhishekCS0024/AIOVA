import uuid

from sqlalchemy.orm import Session

from app.core.config import settings
from app.domain import rules
from app.domain.enums import ChangeSource, SourceType
from app.models import SourceDocument, User
from app.parsers import ParsedDocument, parse_document
from app.parsers.text_parser import parse_text
from app.services import audit_service, investigation_service


def _store(db: Session, investigation_id: uuid.UUID, parsed: ParsedDocument, user: User,
           raw: bytes | None = None) -> SourceDocument:
    rules.ensure_editable(investigation_service.get(db, investigation_id).status)
    storage_path = None
    if raw is not None:
        target_dir = settings.upload_dir / str(investigation_id)
        target_dir.mkdir(parents=True, exist_ok=True)
        path = target_dir / f"{uuid.uuid4()}_{parsed.filename or 'upload'}"
        path.write_bytes(raw)
        storage_path = str(path)

    doc = SourceDocument(
        investigation_id=investigation_id,
        type=parsed.source_type,
        filename=parsed.filename,
        storage_path=storage_path,
        extracted_text=parsed.text,
        doc_metadata={**parsed.metadata, "empty_text": parsed.is_empty},
    )
    db.add(doc)
    db.flush()
    audit_service.record(
        db, investigation_id=investigation_id, user_id=user.id, action="document_added",
        entity="document", entity_id=doc.id, new_value=parsed.filename, source=ChangeSource.USER,
    )
    return doc


def add_upload(db: Session, investigation_id: uuid.UUID, source_type: SourceType,
               data: bytes, filename: str | None, user: User) -> SourceDocument:
    return _store(db, investigation_id, parse_document(source_type, data, filename), user, data)


def add_pasted_text(db: Session, investigation_id: uuid.UUID, text: str, title: str | None,
                    user: User) -> SourceDocument:
    return _store(db, investigation_id, parse_text(text, title or "pasted_text"), user)
