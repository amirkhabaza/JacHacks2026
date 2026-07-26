"""Lifeline FastAPI application — thin HTTP bridge only. No crisis logic."""

from __future__ import annotations

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.config import get_settings
from app.schemas import RootResponse
from app.services.jac_bridge import JacBridge
from app.services.mongodb import MongoDBService


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()

    mongodb = MongoDBService(
        uri=settings.mongodb_uri,
        database_name=settings.mongodb_database,
    )
    jac_bridge = JacBridge(
        project_path=settings.jac_project_path,
        entrypoint=settings.jac_entrypoint,
    )

    # Prefer a local MongoDB. If it is down, keep serving and let /health report degraded.
    try:
        await mongodb.connect()
    except Exception:
        pass

    app.state.mongodb = mongodb
    app.state.jac_bridge = jac_bridge

    try:
        yield
    finally:
        await mongodb.disconnect()


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Lifeline API",
        description=(
            "HTTP bridge to Lifeline Jac walkers. "
            "Jac is the application graph and source of truth."
        ),
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)

    @app.get("/", response_model=RootResponse)
    async def root() -> RootResponse:
        return RootResponse(
            name=settings.app_name,
            status="running",
            documentation="/docs",
        )

    return app


app = create_app()
