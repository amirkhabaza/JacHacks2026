from fastapi import APIRouter, Query

from app.models.schemas import Recommendation, RecommendationsResponse
from app.services.jac_runtime import jac_runtime

router = APIRouter(tags=["recommendations"])


@router.get("/recommendations", response_model=RecommendationsResponse)
def get_recommendations(incident_id: str | None = Query(default=None)) -> RecommendationsResponse:
    snap = jac_runtime.get_dashboard(incident_id)
    return RecommendationsResponse(
        recommendations=[
            Recommendation(**item) for item in snap.get("recommendations", [])
        ],
    )
