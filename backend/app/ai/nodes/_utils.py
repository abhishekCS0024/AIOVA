import json

from app.ai.state import RCAState


def mark_done(state: RCAState, step: str) -> list[str]:
    return [*state.get("completed_steps", []), step]


def as_json(value) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2, default=str)
