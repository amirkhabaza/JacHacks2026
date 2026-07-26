"""Lifeline — Jac entry point.

The graph is the application. Walkers are the intelligence.
Python (../backend) is a thin HTTP bridge; it must not own business logic.

Pipeline (source of truth lives in this graph):
  Report → extract_entities (by llm)
        → create nodes/edges
        → verify_reports
        → propagate_failures
        → allocate_resources
        → explain_decision
        → dashboard_state
        → frontend (React Flow)

TODO(hackathon): wire walker orchestration end-to-end in server.jac.
"""

import from .server { serve_lifeline }

# Re-export node/edge/walker surface so `jac start` / bridge imports resolve
# from a single root module.
import from .nodes.Incident { Incident }
import from .walkers.ingest_report { ingest_report }
import from .walkers.dashboard_state { dashboard_state }

"""Launch Lifeline's Jac-side server surface.

Called by the Python bridge or `jac start` during local demos.
"""
def:pub main -> None {
    # TODO: parse CLI flags (scenario name, dry-run, verbose).
    serve_lifeline();
}
