from dataclasses import dataclass, field

from app.domain.enums import SourceType


@dataclass
class ParsedDocument:
    """Every input format is converted to plain text first (docs §12)."""

    source_type: SourceType
    text: str
    filename: str | None = None
    metadata: dict = field(default_factory=dict)

    @property
    def is_empty(self) -> bool:
        # Scanned PDFs with no text layer: prompt the user to paste content (OCR is future work).
        return not self.text.strip()
