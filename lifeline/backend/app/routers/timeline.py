from fastapi import APIRouter, Query

from app.models.schemas import TimelineEvent, TimelineResponse
from app.services.jac_runtime import jac_runtime

router = APIRouter(tags=["timeline"])


@router.get("/timeline", response_model=TimelineResponse)
def get_timeline(incident_id: str | None = Query(default=None)) -> TimelineResponse:
    snap = jac_runtime.get_dashboard(incident_id)
    events = [TimelineEvent(**e) for e in snap.get("timeline", [])]
    return TimelineResponse(events=events)
