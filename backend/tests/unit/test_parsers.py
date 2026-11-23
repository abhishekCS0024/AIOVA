from app.domain.enums import SourceType
from app.parsers import parse_document
from app.parsers.factory import detect_source_type

EML = b"""From: shift.lead@example.com
To: qa@example.com
Subject: R-201 alarm during crystallization
Date: Mon, 2 Nov 2026 06:10:00 +0000
Content-Type: text/plain

Alarm on R-201 at 02:40. Screen showed normal temperature.
"""


def test_detect_source_type():
    assert detect_source_type("report.pdf", None) == SourceType.PDF
    assert detect_source_type("notes.eml", None) == SourceType.EMAIL
    assert detect_source_type(None, "text/plain") == SourceType.TEXT


def test_parse_email_extracts_headers_and_body():
    parsed = parse_document(SourceType.EMAIL, EML, "shift_notes.eml")
    assert "R-201 alarm" in parsed.text
    assert "Screen showed normal temperature" in parsed.text


def test_empty_text_is_flagged():
    assert parse_document(SourceType.TEXT, b"   ").is_empty
