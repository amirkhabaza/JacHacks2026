"""ingest_report — first walker in the Lifeline pipeline.

Flow:
  1. Accept raw report text + source metadata
  2. Call llm/extract_entities (by llm())
  3. Create Report + Source nodes
  4. Attach/create Incident
  5. Emit reports / affects / requires edges from extracted entities

TODO: implement entity → node mapping table (hospital names, bridge IDs, etc.).
"""

import from ..nodes.Report { Report }
import from ..nodes.Source { Source }
import from ..nodes.Incident { Incident }
import from ..edges.reports { reports }
import from ..llm.extract_entities { extract_crisis_entities }

walker:pub ingest_report {
    has raw_text: str = "",
        source_name: str = "anonymous",
        source_kind: str = "anonymous",
        channel: str = "manual",
        # Outputs for the bridge / next walkers
        report_id: str = "",
        incident_id: str = "",
        extraction: dict = {};

    with Root entry {
        # TODO: spawn or call extract_crisis_entities with .raw_text
        # TODO: create Source node (find-or-create by name)
        # TODO: create Report node with raw_text + extraction summary
        # TODO: find-or-create Incident; ++ reports edge
        # TODO: materialize claimed infrastructure/population nodes + edges
        .extraction = {"status": "stub", "entities": []};
        .report_id = "";
        .incident_id = "";
    }
}
