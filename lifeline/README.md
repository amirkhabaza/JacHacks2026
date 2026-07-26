# Lifeline

**AI-powered humanitarian crisis intelligence — built in Jac.**

Lifeline helps emergency responders verify conflicting reports, predict cascading infrastructure failures, and allocate scarce resources. The **graph is the application**. **Walkers are the intelligence**. Python is only a thin HTTP bridge to the dashboard.

> JacHacks 2026 · Optimized for judging: open `jac/` first — that is where the product lives.

---

## Project Overview

When disasters hit, responders drown in conflicting tips: a bridge is “open” and “collapsed” in the same hour; a hospital loses power while a generator sits unused at a depot; a shelter needs oxygen with no assignment trail.

Lifeline models the crisis as a **Jac object-spatial graph**:

| Concern | Jac construct |
| -------- | ------------- |
| Incidents, hospitals, bridges, reports… | **Nodes** |
| depends_on, corroborates, assigned_to… | **Edges** |
| Ingest, verify, cascade, allocate, explain | **Walkers** |
| Entity extraction & narration | **`by llm()`** |

The Next.js dashboard visualizes live graph traversal (React Flow) and walker timelines. FastAPI does not contain crisis logic.

---

## Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Dashboard (frontend/)               │
│   IncidentFeed │ React Flow Graph │ Recommendations │ Timeline  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ REST
┌───────────────────────────────▼─────────────────────────────────┐
│              FastAPI Bridge (backend/) — no business logic      │
│         /report  /graph  /recommendations  /timeline /scenario  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ spawn walkers
┌───────────────────────────────▼─────────────────────────────────┐
│                     Jac Graph Engine (jac/)                     │
│  IngestReport → VerifyReports → PropagateFailures               │
│       → AllocateResources → ExplainDecision → DashboardState    │
│                     + by llm() extract / summarize              │
└───────────────────────────────┬─────────────────────────────────┘
                                │ optional audit mirror
┌───────────────────────────────▼─────────────────────────────────┐
│                         MongoDB                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```text
lifeline/
├── jac/                 # ★ MOST of the product (nodes, edges, walkers, llm, scenarios, examples)
├── frontend/            # Next.js 15 ops dashboard
├── backend/             # Thin FastAPI ↔ Jac bridge
├── docs/                # architecture, API, demo script, Devpost
├── sample_data/         # realistic disaster JSON fixtures
├── .github/workflows/   # CI stubs
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

---

## Tech Stack

| Layer | Tech |
| ----- | ---- |
| Graph / intelligence | **Jac**, walkers, `by llm()` |
| API bridge | Python 3.12, FastAPI |
| UI | Next.js 15, React, TypeScript, Tailwind, shadcn-style primitives, React Flow |
| Audit store | MongoDB |
| Ops | Docker Compose |

---

## How Jac Works (in Lifeline)

1. A report hits `POST /report`.
2. The bridge spawns **`IngestReport`**, which uses `by llm()` when a model is configured and a deterministic safety fallback otherwise.
3. **`VerifyReports`** walks sibling claims, writing `Corroborates` / `Contradicts`.
4. **`PropagateFailures`** follows dependencies to cascade outages.
5. **`AllocateResources`** matches supply to requirements, writing `AssignedTo`.
6. **`ExplainDecision`** creates a graph-grounded operator rationale.
7. **`DashboardState`** projects the graph for the UI.

The graph remains the **only** source of truth.

---

## Walker Overview

| Walker | Responsibility |
| ------ | ---------------- |
| `IngestReport` | LLM/fallback extract → create Report/Source/Incident + edges |
| `VerifyReports` | Source-weighted corroboration / contradiction scoring |
| `PropagateFailures` | Cascade infrastructure and population impact |
| `AllocateResources` | Match available resources to urgent needs |
| `ExplainDecision` | Operator-facing, graph-grounded rationale |
| `DashboardState` | UI snapshot (nodes, edges, recommendations, timeline) |

Runnable teaching demos (for judges): see [`jac/examples/`](jac/examples/).

---

## How to Run

### Prerequisites

- Jac (`jaclang` / `jac` CLI) with optional byllm model config
- Node.js 20+
- Python 3.12+
- Docker (optional)

### Jac graph service

```bash
cd lifeline/jac
jac check main.jac
jac start main.jac --no-client --port 8001
```

Public walker endpoints are available at `/walker/LoadScenario`,
`/walker/IngestReport`, `/walker/DashboardState`, and `/walker/Health`.

### Backend bridge

```bash
cd lifeline/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
JAC_API_URL=http://localhost:8001 uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd lifeline/frontend
cp ../.env.example ../.env   # or set NEXT_PUBLIC_API_URL
npm install
npm run dev
```

Open http://localhost:3000/app (the ops dashboard) — http://localhost:3000 is the landing page.

### Docker Compose

```bash
cd lifeline
cp .env.example .env
docker compose up --build
```

---

## Demo Flow

1. Click **Earthquake** to seed the Jac scenario.
2. Ingest the conflicting bridge reports from the left feed.
3. Watch React Flow highlight nodes as walkers traverse.
4. Read recommendations + confidence + walker timeline on the right.
5. Optionally run a `jac/examples/*.jac` script live for judges.

Full script: [`docs/demo-script.md`](docs/demo-script.md)

---

## Future Improvements

- Live WebSocket stream of walker hops → React Flow pulses
- Multi-incident map view + offline SMS ingest channel
- Constraint solver inside `allocate_resources`
- Judge-ready recorded capture of cascade animation

---

## Team Parallelization (one-day hackathon)

| Owner | Owns |
| ----- | ---- |
| Dev A | `jac/walkers` + `jac/llm` + scenarios |
| Dev B | `jac/nodes` + `jac/edges` + examples polish |
| Dev C | `frontend` + `backend` bridge wiring |

---

Built for **JacHacks 2026**. The repository should read as: *this was built in Jac*.
