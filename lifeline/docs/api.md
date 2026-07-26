# Lifeline API

Base URL: `http://localhost:8000`

All mutating intelligence runs in Jac. These endpoints only validate I/O and spawn walkers.

## `GET /health`

Liveness for the bridge, Jac service, and optional Mongo audit store.

```json
{ "status": "ok", "jac": "ready", "mongo": "disabled" }
```

## `POST /report`

Ingest a raw crisis report → Jac `IngestReport` and the full walker pipeline.

```json
{
  "text": "Hospital lost power. Bridge may be collapsed.",
  "source_name": "clinic-ops",
  "source_kind": "government",
  "channel": "manual"
}
```

## `GET /graph`

Graph snapshot from `DashboardState`.

Query: `?incident_id=` (optional)

```json
{
  "incident_id": "incident-1",
  "nodes": [
    {
      "id": "bridge-2",
      "type": "Bridge",
      "label": "Bridge Alpha",
      "status": "collapsed",
      "confidence": 1.0,
      "metadata": { "location": "Bay District" }
    }
  ],
  "edges": [
    {
      "id": "edge-18",
      "source": "road-3",
      "target": "bridge-2",
      "type": "depends_on",
      "status": "disrupted"
    }
  ]
}
```

## `GET /recommendations`

Graph-grounded response actions from `AllocateResources`.

```json
{
  "recommendations": [
    {
      "id": "recommendation-28",
      "title": "Reroute oxygen delivery",
      "priority": "critical",
      "confidence": 0.91,
      "reason": "The shelter supply route is disrupted.",
      "actions": ["Use the safe alternate route", "Dispatch 20 oxygen tanks"],
      "evidence_node_ids": ["shelter-5", "resource-8"]
    }
  ]
}
```

## `GET /timeline`

Walker execution events for the UI timeline.

```json
{
  "events": [
    {
      "id": "event-24",
      "walker": "verify_reports",
      "status": "completed",
      "timestamp": "2026-07-26T21:30:01Z",
      "summary": "Detected a conflicting bridge report."
    }
  ]
}
```

## `POST /scenario`

Seed demo graph: `earthquake` | `wildfire` | `flood`.

```json
{ "name": "earthquake" }
```

## Errors

FastAPI returns validation errors (422) for malformed payloads. Jac transport
failures return `status: "error"` and a diagnostic `message` on mutation
endpoints; read endpoints return an empty contract-safe snapshot.
