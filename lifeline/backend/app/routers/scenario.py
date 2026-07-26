from fastapi import APIRouter

from app.models.schemas import ScenarioIn, ScenarioOut
from app.services.jac_runtime import jac_runtime
from app.services.mongo import mongo_store

router = APIRouter(tags=["scenario"])


@router.post("/scenario", response_model=ScenarioOut)
def post_scenario(body: ScenarioIn) -> ScenarioOut:
    """Seed Jac graph with a demo scenario (earthquake | wildfire | flood)."""
    result = jac_runtime.load_scenario(body.name)
    mongo_store.append_event(
        {
            "type": "scenario_loaded",
            "status": result.get("status", "error"),
            "name": body.name,
        }
    )
    if result.get("status") != "error":
        mongo_store.save_snapshot(jac_runtime.get_dashboard())
    return ScenarioOut(
        status=result.get("status", "error"),
        name=body.name,
        message=result.get("message", ""),
    )
