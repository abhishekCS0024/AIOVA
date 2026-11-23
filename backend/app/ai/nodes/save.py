"""Step 8 — Save: runs only after human approval.

Persistence itself happens in AnalysisService (which owns the DB session and
audit logging); this node only marks the graph run as finished.
"""

from app.ai.nodes._utils import mark_done
from app.ai.state import RCAState


def save(state: RCAState) -> dict:
    return {"completed_steps": mark_done(state, "save")}
