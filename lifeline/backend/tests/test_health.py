"""Smoke tests for checkpoint-one health wiring (no Jac logic assertions)."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.services.mongodb import MongoDBService


def test_health() -> None:
    with (
        patch.object(MongoDBService, "connect", new_callable=AsyncMock),
        patch.object(MongoDBService, "disconnect", new_callable=AsyncMock),
        patch.object(MongoDBService, "ping", new_callable=AsyncMock, return_value=True),
    ):
        with TestClient(app) as client:
            response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert body["service"] == "lifeline-api"
    assert body["jac"]["status"] == "healthy"
    assert body["mongodb"]["status"] == "healthy"


def test_root() -> None:
    with (
        patch.object(MongoDBService, "connect", new_callable=AsyncMock),
        patch.object(MongoDBService, "disconnect", new_callable=AsyncMock),
        patch.object(MongoDBService, "ping", new_callable=AsyncMock, return_value=True),
    ):
        with TestClient(app) as client:
            response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "name": "Lifeline",
        "status": "running",
        "documentation": "/docs",
    }
