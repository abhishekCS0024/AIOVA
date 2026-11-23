"""Groq chat model factory. Model name comes from GROQ_MODEL (docs §7.3)."""

from functools import lru_cache

from langchain_groq import ChatGroq

from app.core.config import settings


@lru_cache
def get_llm() -> ChatGroq:
    return ChatGroq(
        model=settings.groq_model,
        api_key=settings.groq_api_key,
        temperature=settings.llm_temperature,
        max_retries=settings.llm_max_retries,
        model_kwargs={"response_format": {"type": "json_object"}},
    )
