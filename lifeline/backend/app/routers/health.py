from fastapi import APIRouter

from app.models.schemas import HealthResponse
from app.services.jac_runtime import jac_runtime
from app.services.mongo import mongo_store

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    jac = jac_runtime.health()
    return HealthResponse(
        status="ok",
        jac=jac.get("jac", "unknown"),
        mongo=mongo_store.health(),
    )
