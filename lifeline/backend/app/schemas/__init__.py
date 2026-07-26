"""Pydantic request and response models for the Lifeline API bridge."""

from __future__ import annotations

from pydantic import BaseModel, Field


class RootResponse(BaseModel):
    name: str
    status: str
    documentation: str


class DependencyStatus(BaseModel):
    status: str = Field(description="healthy or unhealthy")


class HealthResponse(BaseModel):
    status: str = Field(description="healthy or degraded")
    service: str = "lifeline-api"
    jac: DependencyStatus
    mongodb: DependencyStatus
