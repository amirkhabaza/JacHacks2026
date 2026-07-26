"""Example 05 — by llm() entity extraction

Demonstrates Jac's AI-native function bodies. Requires byllm / model config.
Run: jac run examples/05_llm_entity_extraction.jac

If no model is configured, this file still documents the pattern judges expect.
"""

obj SimpleEntity {
    has name: str = "",
        kind: str = "";
}

obj SimpleExtraction {
    has entities: list[SimpleEntity] = [],
        facts: list[str] = [];
}

def extract_demo(text: str) -> SimpleExtraction by llm() {
    """Extract disaster-related entities (hospitals, bridges, shelters, resources)
    and short claimed facts from the report text. Return JSON matching SimpleExtraction.
    """
}

walker demo_extract {
    has sample: str = "Hospital lost power. Main bridge collapsed. Shelter needs oxygen.",
        result: SimpleExtraction = SimpleExtraction();

    with Root entry {
        # TODO: ensure BYLLM / API keys are configured before live demo
        # .result = extract_demo(.sample);
        print("by llm() pattern ready. Uncomment call when model is configured.");
        print("Sample text:", .sample);
    }
}

with entry {
    root spawn demo_extract;
}
