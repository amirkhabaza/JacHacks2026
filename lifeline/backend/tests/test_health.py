"""Smoke tests for the bridge (no Jac logic assertions)."""

from fastapi.testclient import TestClient

from app.main import app
from app.services.mongo import mongo_store

client = TestClient(app)


def test_health(monkeypatch) -> None:
    monkeypatch.setattr(mongo_store, "health", lambda: "ready")
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["mongo"] == "ready"
