"""Contract tests shared by Jac, FastAPI, and the dashboard."""

from fastapi.testclient import TestClient

from app.main import app
from app.services.jac_runtime import jac_runtime

client = TestClient(app)


def _snapshot() -> dict:
    return {
        "incident_id": "earthquake-sf-001",
        "nodes": [
            {
                "id": "bridge-alpha",
                "type": "Bridge",
                "label": "Bridge Alpha",
                "status": "impassable",
                "confidence": 0.94,
                "metadata": {"location": "Sector A"},
            }
        ],
        "edges": [
            {
                "id": "edge-001",
                "source": "bridge-alpha",
                "target": "sunrise-shelter",
                "type": "connected_to",
                "status": "disrupted",
            }
        ],
        "recommendations": [
            {
                "id": "rec-001",
                "title": "Reroute oxygen delivery",
                "priority": "critical",
                "confidence": 0.91,
                "reason": "Bridge Alpha is likely impassable.",
                "actions": [
                    "Use Route Charlie",
                    "Assign Ambulance 1",
                    "Dispatch oxygen from Depot South",
                ],
                "evidence_node_ids": [
                    "bridge-alpha",
                    "report-002",
                    "drone-observation-001",
                ],
            }
        ],
        "timeline": [
            {
                "id": "event-001",
                "walker": "verify_reports",
                "status": "completed",
                "timestamp": "2026-07-26T14:30:01Z",
                "summary": "Detected contradiction regarding Bridge Alpha.",
            }
        ],
    }


def test_graph_contract(monkeypatch) -> None:
    monkeypatch.setattr(jac_runtime, "get_dashboard", lambda _incident_id=None: _snapshot())
    body = client.get("/graph").json()

    assert set(body) == {"incident_id", "nodes", "edges"}
    assert set(body["nodes"][0]) == {
        "id",
        "type",
        "label",
        "status",
        "confidence",
        "metadata",
    }
    assert set(body["edges"][0]) == {"id", "source", "target", "type", "status"}


def test_recommendation_contract(monkeypatch) -> None:
    monkeypatch.setattr(jac_runtime, "get_dashboard", lambda _incident_id=None: _snapshot())
    body = client.get("/recommendations").json()

    assert set(body) == {"recommendations"}
    assert set(body["recommendations"][0]) == {
        "id",
        "title",
        "priority",
        "confidence",
        "reason",
        "actions",
        "evidence_node_ids",
    }


def test_timeline_contract(monkeypatch) -> None:
    monkeypatch.setattr(jac_runtime, "get_dashboard", lambda _incident_id=None: _snapshot())
    body = client.get("/timeline").json()

    assert set(body) == {"events"}
    assert set(body["events"][0]) == {
        "id",
        "walker",
        "status",
        "timestamp",
        "summary",
    }
