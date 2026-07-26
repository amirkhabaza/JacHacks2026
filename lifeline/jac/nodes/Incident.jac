"""Incident — a verified (or suspected) crisis event on the graph.

An Incident is the hub node. Reports attach via `reports` edges.
Infrastructure and populations connect via `affects` / `depends_on`.
"""

node Incident {
    has title: str = "",
        description: str = "",
        # suspected | investigating | confirmed | contained | resolved
        status: str = "suspected",
        severity: float = 0.0,          # 0.0–1.0
        confidence: float = 0.0,        # aggregate verification confidence
        location: str = "",
        started_at: str = "",
        updated_at: str = "",
        tags: list[str] = [];

    # TODO: add helper abilities if Jac abilities are used for local validation
}
