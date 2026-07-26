"""Report — an incoming human/sensor claim about the crisis.

Created by ingest_report after LLM entity extraction.
Linked to Incident via `reports`, to Source via authorship, and to peer
Reports via `corroborates` / `contradicts`.
"""

node Report {
    has raw_text: str = "",
        summary: str = "",
        claimed_facts: list[str] = [],
        # unverified | corroborating | contradictory | discarded
        verification_status: str = "unverified",
        confidence: float = 0.0,
        received_at: str = "",
        language: str = "en",
        channel: str = "manual";   # manual | sms | radio | social | sensor

    # TODO: store LLM extraction provenance (model, prompt hash) for audit
}
