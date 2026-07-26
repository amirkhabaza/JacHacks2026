"""Jac runtime bridge.

TODO: replace stubs with real jaclang / jac-client spawn calls.
All crisis logic must remain in ../jac/walkers/.
"""

from __future__ import annotations

from typing import Any


class JacRuntime:
    """Minimal façade the FastAPI routers call."""

    def __init__(self) -> None:
        # TODO: load jac module path from env JAC_ROOT
        # TODO: initialize jac machine / persistent root
        self._ready = False

    def health(self) -> dict[str, str]:
        # TODO: ping Jac runtime
        return {"jac": "stub", "detail": "JacRuntime not wired yet"}

    def ingest_report(
        self,
        text: str,
        source_name: str = "anonymous",
        source_kind: str = "anonymous",
        channel: str = "manual",
    ) -> dict[str, Any]:
        """Spawn jac walkers: ingest → verify → propagate → allocate → explain."""
        # TODO: root spawn run_crisis_pipeline / ingest_report
        return {
            "status": "stub",
            "message": "Call Jac ingest_report walker (not implemented)",
            "text": text,
            "source_name": source_name,
            "source_kind": source_kind,
            "channel": channel,
        }

    def get_dashboard(self, incident_id: str | None = None) -> dict[str, Any]:
        """Spawn dashboard_state walker; return snapshot dict."""
        # TODO: root spawn dashboard_state
        return {
            "nodes": [],
            "edges": [],
            "recommendations": [],
            "confidence": {"overall": 0.0},
            "timeline": [],
            "active_incident_id": incident_id or "",
        }

    def load_scenario(self, name: str) -> dict[str, Any]:
        """Spawn load_scenario walker."""
        # TODO: root spawn load_scenario(name=...)
        return {
            "status": "stub",
            "name": name,
            "message": "Call Jac load_scenario walker (not implemented)",
        }


jac_runtime = JacRuntime()
