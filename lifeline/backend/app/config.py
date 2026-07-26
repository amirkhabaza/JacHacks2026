"""Application settings loaded from environment variables and optional .env files."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Prefer lifeline/.env (repo root for this package) when running from backend/.
_BACKEND_DIR = Path(__file__).resolve().parents[1]
_LIFELINE_ROOT = _BACKEND_DIR.parent
_ENV_CANDIDATES = (
    str(_LIFELINE_ROOT / ".env"),
    str(_BACKEND_DIR / ".env"),
    ".env",
)


class Settings(BaseSettings):
    """Strongly typed Lifeline configuration."""

    model_config = SettingsConfigDict(
        env_file=_ENV_CANDIDATES,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Lifeline"
    app_env: str = "development"
    log_level: str = "INFO"
    demo_mode: bool = True

    backend_host: str = "0.0.0.0"
    backend_port: int = 8000

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "lifeline"

    jac_project_path: str = "/app/jac"
    jac_entrypoint: str = "main.jac"

    llm_api_key: str = ""
    llm_model: str = ""


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
