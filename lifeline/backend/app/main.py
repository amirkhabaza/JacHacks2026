"""Lifeline FastAPI bridge — thin HTTP layer over Jac walkers.

NO business logic here. Controllers validate I/O and call jac_runtime.
"""

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, report, graph, recommendations, timeline, scenario
from app.services.mongo import mongo_store


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Manage the optional MongoDB audit connection."""
    mongo_store.connect()
    try:
        yield
    finally:
        mongo_store.close()

app = FastAPI(
    title="Lifeline API",
    description="HTTP bridge to Lifeline Jac walkers. The graph is the source of truth.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(report.router)
app.include_router(graph.router)
app.include_router(recommendations.router)
app.include_router(timeline.router)
app.include_router(scenario.router)
