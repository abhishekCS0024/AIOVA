"""Step 6 — Recommend CAPA: corrective + preventive actions linked to causes."""

from app.ai.nodes._utils import as_json, mark_done
from app.ai.schemas import CapaPlan
from app.ai.state import RCAState
from app.ai.structured import invoke_structured


def recommend_capa(state: RCAState) -> dict:
    causes = [c for c in state.get("causes", []) if c.get("status") != "rejected"]
    result = invoke_structured("recommend_capa", CapaPlan, causes=as_json(causes))
    known_ids = {c["id"] for c in causes}
    # Rule 6: drop any action that does not link to a known cause.
    actions = [a for a in result.model_dump(mode="json")["actions"] if a["cause_id"] in known_ids]
    return {"capa": actions, "completed_steps": mark_done(state, "capa")}
