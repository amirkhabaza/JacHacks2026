"""reports — Source/Report → Incident (or Report → Incident).

Meaning: this claim is about / contributes evidence to the Incident.
"""

edge reports {
    has weight: float = 1.0,
        noted_at: str = "";
}
