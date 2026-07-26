"""Source — origin of a Report (citizen, agency, sensor, anonymous).

Reliability influences verify_reports scoring.
"""

node Source {
    has name: str = "",
        # citizen | ngo | government | sensor | anonymous | media
        kind: str = "anonymous",
        reliability: float = 0.5,   # prior trust 0.0–1.0
        contact: str = "",
        last_seen_at: str = "";

    # TODO: update reliability from historical corroboration outcomes
}
