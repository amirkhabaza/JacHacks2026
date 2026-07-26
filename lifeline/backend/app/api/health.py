"""Health endpoint — FastAPI, MongoDB, and Jac bridge status only."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.dependencies import get_jac_bridge, get_mongodb
from app.schemas import DependencyStatus, HealthResponse
from app.services.jac_bridge import JacBridge
from app.services.mongodb import MongoDBService

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health(
    mongodb: MongoDBService = Depends(get_mongodb),
    jac_bridge: JacBridge = Depends(get_jac_bridge),
) -> HealthResponse:
    """Report overall and per-dependency health without leaking internals."""
    mongo_ok = await mongodb.ping()
    try:
        jac_ok = await jac_bridge.health_check()
    except Exception:
        jac_ok = False

    mongo_status = DependencyStatus(status="healthy" if mongo_ok else "unhealthy")
    jac_status = DependencyStatus(status="healthy" if jac_ok else "unhealthy")
    overall = "healthy" if mongo_ok and jac_ok else "degraded"

    return HealthResponse(
        status=overall,
        service="lifeline-api",
        jac=jac_status,
        mongodb=mongo_status,
    )
