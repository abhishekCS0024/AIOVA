"""Step 1 — Ingest: clean parser output and split into labelled sections (no LLM)."""

import re

from app.ai.nodes._utils import mark_done
from app.ai.state import RCAState


def _clean(text: str) -> str:
    text = text.replace("\r\n", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def ingest(state: RCAState) -> dict:
    sections = [
        {"document": src["document"], "source_type": src["source_type"], "text": _clean(src["text"])}
        for src in state.get("sources", [])
    ]
    # TODO: split long documents by heading so each LLM call fits the context window.
    cleaned = "\n\n".join(f"=== {s['document']} ===\n{s['text']}" for s in sections)
    return {
        "cleaned_text": cleaned,
        "sections": sections,
        "completed_steps": mark_done(state, "ingest"),
    }
