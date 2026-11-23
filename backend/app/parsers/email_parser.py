from email import policy
from email.parser import BytesParser

from app.domain.enums import SourceType
from app.parsers.base import ParsedDocument
from app.parsers.pdf_parser import parse_pdf


def parse_email(data: bytes, filename: str | None = None) -> ParsedDocument:
    """Parse a .eml file: headers + plain-text body + text of any PDF attachments."""
    msg = BytesParser(policy=policy.default).parsebytes(data)
    header = "\n".join(f"{k}: {msg.get(k, '')}" for k in ("From", "To", "Date", "Subject"))

    body_part = msg.get_body(preferencelist=("plain", "html"))
    body = body_part.get_content() if body_part else ""

    attachments: list[str] = []
    for part in msg.iter_attachments():
        if part.get_content_type() == "application/pdf":
            parsed = parse_pdf(part.get_payload(decode=True), part.get_filename())
            attachments.append(f"--- attachment: {part.get_filename()} ---\n{parsed.text}")

    return ParsedDocument(
        source_type=SourceType.EMAIL,
        text="\n\n".join([header, body, *attachments]),
        filename=filename,
        metadata={"subject": msg.get("Subject"), "attachments": len(attachments)},
    )
