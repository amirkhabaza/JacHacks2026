"""HTTP bridge to Lifeline's Jac public walkers."""

from __future__ import annotations

import os
from typing import Any

import httpx


class JacRuntime:
    """Minimal façade the FastAPI routers call; contains no crisis logic."""

    def __init__(self, base_url: str | None = None, timeout: float = 90.0) -> None:
        self.base_url = (base_url or os.getenv("JAC_API_URL", "http://localhost:8001")).rstrip("/")
        self.timeout = timeout

    def health(self) -> dict[str, str]:
        result = self._call_walker("Health", {})
        return {
            "jac": result.get("jac", "unavailable"),
            "detail": result.get("message", ""),
        }

    def ingest_report(
        self,
        text: str,
        source_name: str = "anonymous",
        source_kind: str = "anonymous",
        channel: str = "manual",
    ) -> dict[str, Any]:
        """Spawn jac walkers: ingest → verify → propagate → allocate → explain."""
        return self._call_walker(
            "IngestReport",
            {
                "raw_text": text,
                "source_name": source_name,
                "source_kind": source_kind,
                "channel": channel,
                "use_llm": bool(
                    os.getenv("OPENROUTER_API_KEY")
                    or os.getenv("OPENAI_API_KEY")
                ),
            },
        )

    def get_dashboard(self, incident_id: str | None = None) -> dict[str, Any]:
        """Spawn dashboard_state walker; return snapshot dict."""
        payload = {"incident_id": incident_id} if incident_id else {}
        result = self._call_walker("DashboardState", payload)
        if result.get("status") == "error":
            return {
                "nodes": [],
                "edges": [],
                "recommendations": [],
                "confidence": {"overall": 0.0},
                "timeline": [],
                "incident_id": incident_id or "",
                "message": result.get("message", "Jac unavailable"),
            }
        return result

    def load_scenario(self, name: str) -> dict[str, Any]:
        """Spawn load_scenario walker."""
        return self._call_walker("LoadScenario", {"name": name})

    def _call_walker(self, name: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Call a Jac walker and unwrap its first reported value."""
        try:
            response = httpx.post(
                f"{self.base_url}/walker/{name}",
                json=payload,
                timeout=self.timeout,
            )
            response.raise_for_status()
            envelope = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            return {
                "status": "error",
                "message": f"Jac walker {name} unavailable: {exc}",
            }

        if not envelope.get("ok", False):
            error = envelope.get("error") or {}
            return {
                "status": "error",
                "message": error.get("message", f"Jac walker {name} failed"),
            }

        data = envelope.get("data") or {}
        reports = data.get("reports") or (data.get("result") or {}).get("reports") or []
        if not reports:
            return {"status": "ok", "message": f"Jac walker {name} completed"}
        report = reports[0]
        return report if isinstance(report, dict) else {"status": "ok", "result": report}


jac_runtime = JacRuntime()
