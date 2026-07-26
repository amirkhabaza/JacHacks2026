"""Lifeline server surface — orchestration hub for crisis walkers.

Responsibilities:
  - Seed / reset graph for demo scenarios
  - Accept ingested reports and spawn the intelligence pipeline
  - Expose snapshot payloads consumed by the Python bridge (and thus the UI)

Business rules belong in walkers under ./walkers/, not here.
"""

import from .scenarios.earthquake { seed_earthquake }
import from .walkers.ingest_report { ingest_report }
import from .walkers.verify_reports { verify_reports }
import from .walkers.propagate_failures { propagate_failures }
import from .walkers.allocate_resources { allocate_resources }
import from .walkers.explain_decision { explain_decision }
import from .walkers.dashboard_state { dashboard_state }

"""Register Lifeline's public Jac API for the FastAPI bridge.

TODO:
  - Bind walker spawn helpers to named entrypoints the bridge can call
  - Persist graph snapshots / event log hooks for MongoDB mirroring (optional)
  - Emit traversal events for live React Flow highlighting
"""
def:pub serve_lifeline -> None {
    # Placeholder bootstrap — replace with real registration when jac-client
    # or custom bridge wiring is finalized.
    print("Lifeline Jac server surface ready (stub).");
    print("Spawn walkers via bridge: ingest → verify → propagate → allocate → explain → dashboard.");
}

"""Run the full intelligence pipeline for one raw report text.

Returns a dashboard snapshot dict shape expected by GET /graph and friends.
"""
walker:pub run_crisis_pipeline {
    has raw_text: str = "",
        source_name: str = "anonymous",
        # Output payload assembled for the bridge (stub fields).
        result: dict = {};

    with Root entry {
        # TODO: spawn ingest_report with raw_text / source_name
        # TODO: spawn verify_reports on the new Incident
        # TODO: spawn propagate_failures from damaged infrastructure
        # TODO: spawn allocate_resources for unmet requires edges
        # TODO: spawn explain_decision for the allocation plan
        # TODO: spawn dashboard_state and assign to .result
        .result = {
            "status": "stub",
            "message": "Pipeline not implemented — see walkers/ TODOs",
            "raw_text": .raw_text
        };
    }
}

"""Load a named demo scenario onto root (earthquake | wildfire | flood)."""
walker:pub load_scenario {
    has name: str = "earthquake",
        ok: bool = False;

    with Root entry {
        # TODO: dispatch to scenarios/*.jac seeders
        if .name == "earthquake" {
            # seed_earthquake should attach Incident + infrastructure under root
            .ok = True;
        } else {
            .ok = False;
        }
    }
}
