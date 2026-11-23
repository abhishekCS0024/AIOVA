import io

import pdfplumber

from app.domain.enums import SourceType
from app.parsers.base import ParsedDocument


def parse_pdf(data: bytes, filename: str | None = None) -> ParsedDocument:
    pages: list[str] = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            pages.append(f"[page {i}]\n{page.extract_text() or ''}")
        page_count = len(pdf.pages)
    # TODO: fall back to PyMuPDF (fitz) for PDFs pdfplumber handles poorly.
    return ParsedDocument(
        source_type=SourceType.PDF,
        text="\n\n".join(pages),
        filename=filename,
        metadata={"pages": page_count},
    )
