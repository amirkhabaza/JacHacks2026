# Lifeline Architecture

## Principle

**The graph is the application. Walkers are the intelligence. Python is a bridge.**

Lifeline is intentionally *not* a Python monolith with Jac sprinkled in. Crisis domain logic — verification, cascade prediction, allocation, explanation — lives in Jac modules under `jac/`.

## Checkpoint one (current)

```text
Client / curl
    │
    ▼
FastAPI (backend/)     ← thin bridge only
    ├── GET /          → Lifeline metadata
    ├── GET /health    → MongoDB ping + mocked JacBridge
    ├── MongoDBService → local MongoDB (audit later)
    └── JacBridge      → mocked (real Jac runtime later)
```

Allowed in Python today:

- Request / response models
- Health and process wiring
- MongoDB connectivity
- Mocked Jac bridge façade

Forbidden in Python (always):

- NLP / entity extraction
- Verification scoring
- Allocation algorithms
- Cascade simulation

## Target layers (later milestones)

### 1. Jac graph engine (`jac/`)

- **Nodes** (`jac/nodes/`): Incident, Report, Source, Hospital, Shelter, Vehicle, Resource, CitizenGroup, Bridge, Road, SupplyDepot
- **Edges** (`jac/edges/`): reports, affects, depends_on, connected_to, corroborates, contradicts, assigned_to, supplies, requires
- **Walkers** (`jac/walkers/`): ingest → verify → propagate → allocate → explain → dashboard
- **LLM** (`jac/llm/`): `by llm()` extract + summarize
- **Scenarios** (`jac/scenarios/`): earthquake, wildfire, flood seeders
- **Examples** (`jac/examples/`): judge-facing capability demos

### 2. HTTP bridge (`backend/`)

FastAPI routes will map 1:1 to Jac walkers via `JacBridge.execute_walker(...)`.

### 3. Dashboard (`frontend/`)

Next.js App Router ops UI (scaffold present; not part of checkpoint one).

### 4. MongoDB

Supporting store for event log + snapshots. **Not** the source of truth.

## Planned data flow

```text
POST /report
  → JacBridge.execute_walker("ingest_report", ...)
    → ingest_report walker
      → extract_entities by llm()
      → create nodes/edges
    → verify_reports
    → propagate_failures
    → allocate_resources
    → explain_decision
    → dashboard_state
  → JSON to UI
```

## Why this wins on the Jac rubric

- Majority of domain files are `.jac`
- Every major feature maps to a walker
- Every object is a node; every relationship an edge
- `jac/examples` prove capabilities independently during judging
- Frontend visualizes traversal, not a CRUD table

See also: [CHANGES.md](./CHANGES.md) · [api-contract.md](./api-contract.md)
