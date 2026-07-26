from fastapi import APIRouter, Query

from app.models.schemas import RecommendationsResponse
from app.services.jac_runtime import jac_runtime

router = APIRouter(tags=["recommendations"])


@router.get("/recommendations", response_model=RecommendationsResponse)
def get_recommendations(incident_id: str | None = Query(default=None)) -> RecommendationsResponse:
    snap = jac_runtime.get_dashboard(incident_id)
    return RecommendationsResponse(
        recommendations=snap.get("recommendations", []),
        confidence=snap.get("confidence", {}),
        explanation=snap.get("explanation", ""),
    )
