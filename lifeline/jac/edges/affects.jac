"""affects — Incident (or failure) → infrastructure / population.

Meaning: the crisis or cascading failure impacts this node.
"""

edge affects {
    has severity: float = 0.0,
        impact_type: str = "",   # power_loss | structural | access | medical | other
        noted_at: str = "";
}
