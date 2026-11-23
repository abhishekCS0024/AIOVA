from langgraph.checkpoint.memory import MemorySaver

from app.ai.graph import build_graph


def test_graph_compiles_with_expected_nodes():
    graph = build_graph(checkpointer=MemorySaver())
    nodes = set(graph.get_graph().nodes)
    assert {
        "ingest", "extract", "gap_check", "analyze",
        "rank_causes", "recommend_capa", "human_review", "save",
    } <= nodes
