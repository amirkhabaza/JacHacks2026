"""summarize_incident — LLM narration for operators and explain_decision."""

obj IncidentNarrative {
    has headline: str = "",
        situation: str = "",
        risks: list[str] = [],
        recommended_actions: list[str] = [],
        uncertainty: str = "";
}

"""Summarize incident graph context for human responders.

`context` should include verification scores, cascade path, and allocations.
"""
def summarize_incident_context(context: dict) -> IncidentNarrative by llm() {
    """You are Lifeline's incident narrator for emergency operations centers.

    Using the provided graph context (verification, cascades, allocations),
    produce a concise, actionable narrative. Prefer clear uncertainty language
    over false precision. Never invent nodes that are not in context.
    """
}
