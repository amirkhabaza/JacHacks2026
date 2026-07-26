"""dashboard_state — project the live graph into a UI-friendly snapshot.

Returned to the Python bridge for:
  GET /graph
  GET /recommendations
  GET /timeline

Must include nodes, edges, recommendations, confidence, and walker timeline
events so React Flow can highlight traversal live.
"""

obj GraphNodeDTO {
    has id: str = "",
        label: str = "",
        kind: str = "",
        status: str = "",
        confidence: float = 0.0,
        meta: dict = {};
}

obj GraphEdgeDTO {
    has id: str = "",
        source: str = "",
        target: str = "",
        kind: str = "",
        meta: dict = {};
}

obj TimelineEventDTO {
    has id: str = "",
        walker: str = "",
        message: str = "",
        node_id: str = "",
        at: str = "";
}

obj DashboardSnapshot {
    has nodes: list[GraphNodeDTO] = [],
        edges: list[GraphEdgeDTO] = [],
        recommendations: list[dict] = [],
        confidence: dict = {},
        timeline: list[TimelineEventDTO] = [],
        active_incident_id: str = "";
}

walker:pub dashboard_state {
    has incident_id: str = "",
        snapshot: DashboardSnapshot = DashboardSnapshot();

    with Root entry {
        # TODO: walk Incident subgraph; fill GraphNodeDTO / GraphEdgeDTO lists
        # TODO: pull latest allocation assignments as recommendations
        # TODO: include recent walker log as timeline events
        .snapshot = DashboardSnapshot(
            nodes=[],
            edges=[],
            recommendations=[],
            confidence={"overall": 0.0},
            timeline=[],
            active_incident_id=.incident_id
        );
    }
}
