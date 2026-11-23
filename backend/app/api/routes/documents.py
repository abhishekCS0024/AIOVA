import uuid
from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.api.deps import CurrentUser, DbSession
from app.core.config import settings
from app.parsers.factory import detect_source_type
from app.schemas.document import DocumentRead, PastedTextIn
from app.services import document_service

router = APIRouter()


@router.post(
    "/{investigation_id}/documents",
    response_model=DocumentRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    investigation_id: uuid.UUID, db: DbSession, user: CurrentUser, file: Annotated[UploadFile, File()]
):
    """Upload a PDF or an email (.eml). Plain text files are accepted too."""
    data = await file.read()
    if len(data) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "File too large")
    source_type = detect_source_type(file.filename, file.content_type)
    return document_service.add_upload(db, investigation_id, source_type, data, file.filename, user)


@router.post(
    "/{investigation_id}/documents/text",
    response_model=DocumentRead,
    status_code=status.HTTP_201_CREATED,
)
def submit_pasted_text(
    investigation_id: uuid.UUID, body: PastedTextIn, db: DbSession, user: CurrentUser
):
    return document_service.add_pasted_text(db, investigation_id, body.text, body.title, user)
