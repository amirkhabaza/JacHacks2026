# Lifeline API

Base URL: `http://localhost:8000`

All mutating intelligence runs in Jac. These endpoints only validate I/O and spawn walkers.

## `GET /health`

Liveness for bridge + Jac + Mongo stubs.

```json
{ "status": "ok", "jac": "stub", "mongo": "stub" }
```

## `POST /report`

Ingest a raw crisis report → Jac `ingest_report` (+ pipeline).

```json
{
  "text": "Hospital lost power. Bridge may be collapsed.",
  "source_name": "clinic-ops",
  "source_kind": "government",
  "channel": "manual"
}
```

## `GET /graph`

React Flow snapshot from `dashboard_state`.

Query: `?incident_id=` (optional)

```json
{
  "nodes": [{ "id": "...", "label": "...", "kind": "Hospital", "status": "offline", "confidence": 0.0, "meta": {} }],
  "edges": [{ "id": "...", "source": "...", "target": "...", "kind": "depends_on", "meta": {} }],
  "active_incident_id": "..."
}
```

## `GET /recommendations`

Allocations + explanation fields from dashboard projection.

## `GET /timeline`

Walker execution events for the UI timeline.

## `POST /scenario`

Seed demo graph: `earthquake` | `wildfire` | `flood`.

```json
{ "name": "earthquake" }
```

## Errors

Bridge returns FastAPI validation errors (422) for bad payloads. Jac failures should surface as `status: "error"` with `message` once `JacRuntime` is wired.
