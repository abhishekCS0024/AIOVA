from app.core.exceptions import DocumentParseError
from app.domain.enums import SourceType
from app.parsers.base import ParsedDocument
from app.parsers.email_parser import parse_email
from app.parsers.pdf_parser import parse_pdf
from app.parsers.text_parser import parse_text


def detect_source_type(filename: str | None, content_type: str | None) -> SourceType:
    name = (filename or "").lower()
    if name.endswith(".pdf") or content_type == "application/pdf":
        return SourceType.PDF
    if name.endswith(".eml") or content_type == "message/rfc822":
        return SourceType.EMAIL
    return SourceType.TEXT


def parse_document(source_type: SourceType, data: bytes, filename: str | None = None) -> ParsedDocument:
    try:
        if source_type == SourceType.PDF:
            return parse_pdf(data, filename)
        if source_type == SourceType.EMAIL:
            return parse_email(data, filename)
        return parse_text(data.decode("utf-8", errors="replace"), filename)
    except Exception as exc:  # surface any parser failure as a 422
        raise DocumentParseError(f"Could not read {filename or source_type}: {exc}") from exc
