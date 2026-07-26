# Lifeline API Contract — Checkpoint One

Lifeline is a Jac-first humanitarian crisis intelligence platform.

## Roles

| Component | Role |
| --------- | ---- |
| **Jac** | Application graph and source of truth. Nodes, edges, walkers, and LLM calls live here. |
| **FastAPI** | Thin HTTP integration layer only. Validates I/O, checks health, and will later spawn Jac walkers. Contains **no** humanitarian decision logic. |
| **MongoDB** | Supporting store for later audit / event mirroring. Not the source of truth. |
| **Jac bridge** | Adapter between FastAPI and Jac. **Mocked in checkpoint one** — `health_check()` returns healthy; `execute_walker()` returns a labeled mock payload. Real Jac runtime invocation is deferred. |

## Base URL

Local development: `http://localhost:8000`

Interactive docs: `http://localhost:8000/docs`

## Endpoints

### `GET /`

Returns Lifeline service metadata.

```json
{
  "name": "Lifeline",
  "status": "running",
  "documentation": "/docs"
}
```

### `GET /health`

Checks FastAPI process availability plus MongoDB connectivity and the (mocked) Jac bridge.

Healthy response:

```json
{
  "status": "healthy",
  "service": "lifeline-api",
  "jac": {
    "status": "healthy"
  },
  "mongodb": {
    "status": "healthy"
  }
}
```

If MongoDB or the Jac bridge is unavailable, `status` is `degraded` and the unhealthy dependency is marked `"status": "unhealthy"`. Stack traces and secrets are never returned.

## Checkpoint status

Checkpoint one verifies repository layout, MongoDB connectivity (local install preferred; Docker Compose optional), FastAPI startup, and `/health` wiring. Scenario loading, report ingestion, frontend work, and real Jac execution are out of scope for this checkpoint.

Full changelog: [CHANGES.md](./CHANGES.md)
