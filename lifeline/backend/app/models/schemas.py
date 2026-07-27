"""Shared Pydantic schemas for the bridge. Mirror Jac DTOs — do not diverge."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    jac: str = "unknown"
    mongo: str = "unknown"


class ReportIn(BaseModel):
    text: str = Field(..., min_length=1, description="Raw crisis report text")
    source_name: str = "anonymous"
    source_kind: str = "anonymous"
    channel: str = "manual"


class ReportOut(BaseModel):
    status: str
    report_id: str | None = None
    incident_id: str | None = None
    message: str = ""
    raw: dict[str, Any] = Field(default_factory=dict)


class GraphNode(BaseModel):
    id: str
    type: str
    label: str
    status: str = ""
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    metadata: dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str
    status: str


class GraphResponse(BaseModel):
    incident_id: str
    nodes: list[GraphNode] = Field(default_factory=list)
    edges: list[GraphEdge] = Field(default_factory=list)


class Recommendation(BaseModel):
    id: str
    title: str
    priority: Literal["critical", "high", "medium", "low"]
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str
    actions: list[str] = Field(default_factory=list)
    evidence_node_ids: list[str] = Field(default_factory=list)


class RecommendationsResponse(BaseModel):
    recommendations: list[Recommendation] = Field(default_factory=list)


class TimelineEvent(BaseModel):
    id: str
    walker: str
    status: Literal["running", "completed", "failed"]
    timestamp: str
    summary: str


class TimelineResponse(BaseModel):
    events: list[TimelineEvent] = Field(default_factory=list)


class ScenarioIn(BaseModel):
    name: str = Field(..., pattern="^(earthquake|wildfire|flood)$")


class ScenarioOut(BaseModel):
    status: str
    name: str
    message: str = ""
