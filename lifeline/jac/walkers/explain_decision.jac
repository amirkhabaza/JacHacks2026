"""explain_decision — narrate why allocations / confidence look the way they do.

Uses by llm() (summarize_incident + local graph context) to produce
operator-facing explanations for the RecommendationPanel.
"""

import from ..llm.summarize_incident { summarize_incident_context }

walker:pub explain_decision {
    has incident_id: str = "",
        explanation: str = "",
        confidence_breakdown: dict = {},
        key_edges: list[str] = [];

    with Root entry {
        # TODO: gather Incident + recent walker outcomes into a context dict
        # TODO: call summarize_incident_context (by llm)
        # TODO: attach structured confidence_breakdown for ConfidenceCard
        .explanation = "Decision explanation stub — implement with by llm().";
        .confidence_breakdown = {
            "verification": 0.0,
            "source_reliability": 0.0,
            "cascade_certainty": 0.0,
            "allocation_coverage": 0.0
        };
        .key_edges = [];
    }
}
