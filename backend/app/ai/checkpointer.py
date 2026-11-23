"""Postgres-backed LangGraph checkpointer (stores paused graphs between requests)."""

from functools import lru_cache

from langgraph.checkpoint.postgres import PostgresSaver
from psycopg_pool import ConnectionPool

from app.core.config import settings


@lru_cache
def _pool() -> ConnectionPool:
    return ConnectionPool(
        conninfo=settings.checkpoint_db_url,
        kwargs={"autocommit": True, "prepare_threshold": 0},
        open=True,
    )


@lru_cache
def get_checkpointer() -> PostgresSaver:
    saver = PostgresSaver(_pool())
    saver.setup()
    return saver


def close_checkpointer() -> None:
    """Close the pool on app shutdown (only if it was ever opened)."""
    if _pool.cache_info().currsize:
        _pool().close()
        _pool.cache_clear()
        get_checkpointer.cache_clear()
