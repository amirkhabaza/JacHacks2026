# Lifeline Architecture

## Principle

**The graph is the application. Walkers are the intelligence. Python is a bridge.**

Lifeline is intentionally *not* a Python monolith with Jac sprinkled in. Crisis domain logic — verification, cascade prediction, allocation, explanation — lives in Jac modules under `jac/`.

## Layers

### 1. Jac graph engine (`jac/`)

- **Nodes** (`jac/nodes/`): Incident, Report, Source, Hospital, Shelter, Vehicle, Resource, CitizenGroup, Bridge, Road, SupplyDepot
- **Edges** (`jac/edges/`): reports, affects, depends_on, connected_to, corroborates, contradicts, assigned_to, supplies, requires
- **Walkers** (`jac/walkers/`): ingest → verify → propagate → allocate → explain → dashboard
- **LLM** (`jac/llm/`): `by llm()` extract + summarize
- **Scenarios** (`jac/scenarios/`): earthquake, wildfire, flood seeders
- **Examples** (`jac/examples/`): judge-facing capability demos

### 2. HTTP bridge (`backend/`)

FastAPI routers map 1:1 to Jac entrypoints via `JacRuntime`.

Allowed responsibilities:

- Request validation (Pydantic)
- Calling Jac walkers
- Optional MongoDB audit mirroring
- CORS / health

Forbidden:

- NLP / entity extraction
- Verification scoring
- Allocation algorithms
- Cascade simulation

### 3. Dashboard (`frontend/`)

Next.js App Router, dark ops UI, three columns:

1. Incoming reports (ingest actions)
2. React Flow live graph
3. Recommendations, confidence, walker timeline

### 4. MongoDB

Optional. Stores event log + snapshots for replay. **Not** the source of truth.

## Data flow

```text
POST /report
  → JacRuntime.ingest_report()
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
