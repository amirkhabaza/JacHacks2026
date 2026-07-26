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
│  ingest_report → verify_reports → propagate_failures            │
│       → allocate_resources → explain_decision → dashboard_state │
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
2. The bridge spawns **`ingest_report`**, which calls **`extract_entities` (`by llm()`)** and materializes nodes/edges.
3. **`verify_reports`** walks sibling claims, writing `corroborates` / `contradicts`.
4. **`propagate_failures`** follows `depends_on` to cascade outages.
5. **`allocate_resources`** matches supply to `requires`, writing `assigned_to`.
6. **`explain_decision`** narrates the plan for operators.
7. **`dashboard_state`** projects the graph for the UI.

The graph remains the **only** source of truth.

---

## Walker Overview

| Walker | Responsibility |
| ------ | ---------------- |
| `ingest_report` | LLM extract → create Report/Source/Incident + edges |
| `verify_reports` | Corroboration / contradiction scoring |
| `propagate_failures` | Cascade along `depends_on` |
| `allocate_resources` | Match Resources/Vehicles to needs |
| `explain_decision` | Operator-facing rationale (`by llm()`) |
| `dashboard_state` | UI snapshot (nodes, edges, timeline) |

Runnable teaching demos (for judges): see [`jac/examples/`](jac/examples/).

---

## How to Run

### Prerequisites

- Jac (`jaclang` / `jac` CLI) with optional byllm model config
- Node.js 20+
- Python 3.12+
- Docker (optional)

### Jac examples (demo for judges)

```bash
cd lifeline/jac
jac run examples/01_graph_creation.jac
jac run examples/02_node_traversal.jac
jac run examples/03_edge_creation.jac
jac run examples/04_walker_execution.jac
jac run examples/06_multi_walker_orchestration.jac
# jac run examples/05_llm_entity_extraction.jac   # needs byllm keys
```

### Backend bridge

```bash
cd lifeline/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd lifeline/frontend
cp ../.env.example ../.env   # or set NEXT_PUBLIC_API_URL
npm install
npm run dev
```

Open http://localhost:3000

### Docker Compose

```bash
cd lifeline
cp .env.example .env
docker compose up --build
```

---

## Demo Flow

1. Click **Earthquake** (seeds Jac scenario — once implemented).
2. Ingest the conflicting bridge reports from the left feed.
3. Watch React Flow highlight nodes as walkers traverse.
4. Read recommendations + confidence + walker timeline on the right.
5. Optionally run a `jac/examples/*.jac` script live for judges.

Full script: [`docs/demo-script.md`](docs/demo-script.md)

---

## Future Improvements

- Complete walker bodies and scenario seeders
- Wire `JacRuntime` to real jac spawn / persistent root
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
