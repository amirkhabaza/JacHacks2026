"""Lifeline FastAPI bridge — thin HTTP layer over Jac walkers.

NO business logic here. Controllers validate I/O and call jac_runtime.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, report, graph, recommendations, timeline, scenario

app = FastAPI(
    title="Lifeline API",
    description="HTTP bridge to Lifeline Jac walkers. The graph is the source of truth.",
    version="0.1.0",
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
