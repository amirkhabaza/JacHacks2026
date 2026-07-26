"""extract_entities — LLM-backed NER / fact extraction for crisis reports.

Uses Jac `by llm()` so intelligence stays in the Jac layer.
"""

obj ExtractedEntity {
    has name: str = "",
        # hospital | shelter | bridge | road | vehicle | resource | citizen_group | other
        kind: str = "other",
        attributes: dict = {};
}

obj ExtractionResult {
    has summary: str = "",
        entities: list[ExtractedEntity] = [],
        claimed_facts: list[str] = [],
        suggested_severity: float = 0.0,
        conflicts_hint: str = "";
}

"""Extract structured crisis entities from free-text.

TODO: refine prompt with few-shot Lifeline schema examples.
TODO: validate kinds against allowed node types before graph writes.
"""
def extract_crisis_entities(raw_text: str) -> ExtractionResult by llm() {
    """You are Lifeline's crisis entity extractor.

    Given an emergency report, return structured entities and claimed facts
    matching Lifeline's graph model (Hospital, Shelter, Bridge, Road, Vehicle,
    Resource, CitizenGroup, SupplyDepot). Flag likely contradictions.
    """
}
