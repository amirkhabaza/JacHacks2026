from fastapi import APIRouter, Query

from app.models.schemas import GraphEdge, GraphNode, GraphResponse
from app.services.jac_runtime import jac_runtime

router = APIRouter(tags=["graph"])


@router.get("/graph", response_model=GraphResponse)
def get_graph(incident_id: str | None = Query(default=None)) -> GraphResponse:
    """Return React Flow–ready graph from Jac dashboard_state walker."""
    snap = jac_runtime.get_dashboard(incident_id)
    nodes = [GraphNode(**n) for n in snap.get("nodes", [])]
    edges = [GraphEdge(**e) for e in snap.get("edges", [])]
    return GraphResponse(
        incident_id=snap.get("incident_id", ""),
        nodes=nodes,
        edges=edges,
    )
