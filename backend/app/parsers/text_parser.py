from app.domain.enums import SourceType
from app.parsers.base import ParsedDocument


def parse_text(text: str, filename: str | None = None) -> ParsedDocument:
    return ParsedDocument(source_type=SourceType.TEXT, text=text.strip(), filename=filename)
