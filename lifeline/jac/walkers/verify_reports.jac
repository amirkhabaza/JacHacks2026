"""verify_reports — score corroboration vs contradiction across Reports.

Walks Reports linked to an Incident, builds corroborates/contradicts edges,
updates Report.confidence and Incident.confidence.

Judges care: this is pure graph intelligence — no Python business rules.
"""

import from ..nodes.Report { Report }
import from ..nodes.Incident { Incident }
import from ..edges.corroborates { corroborates }
import from ..edges.contradicts { contradicts }

walker:pub verify_reports {
    has incident_id: str = "",
        min_agreement: float = 0.6,
        verified_count: int = 0,
        conflict_count: int = 0,
        incident_confidence: float = 0.0;

    with Root entry {
        # TODO: locate Incident by id / visit reports edges
        # TODO: pairwise compare claimed_facts (LLM-assisted optional)
        # TODO: ++ corroborates or contradicts between Report pairs
        # TODO: roll up Incident.confidence + status
        .incident_confidence = 0.0;
    }

    with Incident entry {
        # TODO: visit connected Report nodes
    }

    with Report entry {
        # TODO: compare against sibling reports; update verification_status
    }
}
