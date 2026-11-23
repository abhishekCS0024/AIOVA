"""LangGraph definition of the eight-step RCA pipeline (docs §7).

    ingest → extract → gap_check → analyze → rank_causes → recommend_capa
           → human_review (interrupt) ─approve→ save
                                      └─rerun──→ analyze
"""

from langgraph.graph import END, START, StateGraph
from langgraph.graph.state import CompiledStateGraph

from app.ai.nodes import (
    analyze,
    extract,
    gap_check,
    human_review,
    ingest,
    rank_causes,
    recommend_capa,
    save,
)
from app.ai.state import RCAState
from app.domain.enums import PipelineStep

# Steps that can be re-run on their own: POST /investigations/{id}/analyze/{step}
STEP_NODES = {
    PipelineStep.EXTRACT: extract,
    PipelineStep.GAPS: gap_check,
    PipelineStep.ANALYZE: analyze,
    PipelineStep.CAUSES: rank_causes,
    PipelineStep.CAPA: recommend_capa,
}


def _after_review(state: RCAState) -> str:
    return "save" if state.get("review_decision") == "approve" else "analyze"


def build_graph(checkpointer=None) -> CompiledStateGraph:
    g = StateGraph(RCAState)
    g.add_node("ingest", ingest)
    g.add_node("extract", extract)
    g.add_node("gap_check", gap_check)
    g.add_node("analyze", analyze)
    g.add_node("rank_causes", rank_causes)
    g.add_node("recommend_capa", recommend_capa)
    g.add_node("human_review", human_review)
    g.add_node("save", save)

    g.add_edge(START, "ingest")
    g.add_edge("ingest", "extract")
    g.add_edge("extract", "gap_check")
    g.add_edge("gap_check", "analyze")
    g.add_edge("analyze", "rank_causes")
    g.add_edge("rank_causes", "recommend_capa")
    g.add_edge("recommend_capa", "human_review")
    g.add_conditional_edges("human_review", _after_review, {"save": "save", "analyze": "analyze"})
    g.add_edge("save", END)

    return g.compile(checkpointer=checkpointer)
