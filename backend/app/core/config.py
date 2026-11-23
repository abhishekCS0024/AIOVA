"""Application settings, loaded from environment variables / .env."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

APP_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env", "../.env"), extra="ignore")

    app_name: str = "AI-Assisted RCA Module"
    environment: str = "development"
    api_prefix: str = "/api"
    cors_origins: list[str] = ["http://localhost:5173"]

    database_url: str = "postgresql+psycopg://rca:rca@localhost:5432/rca"

    # LLM (Groq). Model is configurable because Groq retires models (see docs §7.3).
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"
    llm_temperature: float = 0.1
    llm_validation_retries: int = 1
    # Retries on Groq 429/5xx; the SDK honours retry-after (free tier is ~8k tokens/min).
    llm_max_retries: int = 8

    upload_dir: Path = APP_DIR.parent / "storage" / "uploads"
    max_upload_mb: int = 20

    # Built React app (vite build outputs here) — served by FastAPI in the monolith.
    static_dir: Path = APP_DIR / "static"

    @property
    def checkpoint_db_url(self) -> str:
        """LangGraph's Postgres saver wants a plain libpq URL (no SQLAlchemy driver suffix)."""
        return self.database_url.replace("postgresql+psycopg://", "postgresql://")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
