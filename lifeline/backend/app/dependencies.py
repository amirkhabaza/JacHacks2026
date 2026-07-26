"""FastAPI dependencies that read shared services from app.state."""

from __future__ import annotations

from fastapi import Request

from app.services.jac_bridge import JacBridge
from app.services.mongodb import MongoDBService


def get_mongodb(request: Request) -> MongoDBService:
    return request.app.state.mongodb


def get_jac_bridge(request: Request) -> JacBridge:
    return request.app.state.jac_bridge
