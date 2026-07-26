# Checkpoint one — changes

This document explains what was built and reorganized for **Lifeline checkpoint one** on branch `integration-demo-infrastructure`.

## Goal

Stand up a clear Jac-first monorepo where:

- **Jac** remains the application graph and source of truth
- **FastAPI** is only a thin HTTP bridge
- **MongoDB** is a supporting store
- Frontend and real Jac execution are **not** required yet

## What changed

### Repository layout

Kept the monorepo shape under `lifeline/`:

```text
lifeline/
├── jac/                 # Jac graph (nodes, edges, walkers, llm, scenarios, examples)
├── frontend/            # Next.js scaffold (later milestone)
├── backend/             # Thin FastAPI bridge (checkpoint focus)
├── docs/                # Contracts, architecture, this changelog
├── sample_data/         # Scenario fixtures for later
├── .github/workflows/   # Placeholder for Lifeline-scoped workflows
├── README.md            # How to run checkpoint one
├── .env.example         # Local-first env template
├── .gitignore
└── docker-compose.yml   # Optional MongoDB only (not required)
```

### Backend reshape (checkpoint API)

Replaced the earlier stub routers / models with a minimal bridge:

| Path | Role |
| `backend/app/main.py` | FastAPI app, lifespan, CORS (`localhost:3000`), `GET /` |
| `backend/app/config.py` | Pydantic Settings + cached `get_settings()` |
| `backend/app/dependencies.py` | Inject `MongoDBService` and `JacBridge` from `app.state` |
| `backend/app/api/health.py` | `GET /health` |
| `backend/app/services/mongodb.py` | Motor client, connect / disconnect / ping |
| `backend/app/services/jac_bridge.py` | **Mocked** Jac adapter (no real walker execution) |
| `backend/app/schemas/` | Pydantic response models |
| `backend/Dockerfile` | Python 3.12 slim image (not wired into Compose yet) |
| `backend/requirements.txt` | FastAPI, Uvicorn, Motor, Pydantic Settings, HTTPX, dotenv |
| `backend/tests/test_health.py` | Smoke tests for `/` and `/health` |

**Removed** from the checkpoint surface (deferred to later milestones):

- `backend/app/routers/` (`report`, `graph`, `recommendations`, `timeline`, `scenario`)
- `backend/app/models/`
- Stub `jac_runtime.py` / `mongo.py`
- Root multi-stage `lifeline/Dockerfile`

### Configuration

- `.env.example` defaults to **local** MongoDB: `mongodb://localhost:27017`
- Docker Compose is optional; preferred path is Homebrew MongoDB
- `.env` is gitignored — never commit secrets
- App still boots if MongoDB is down; `/health` returns `degraded` and can reconnect on later pings

### MongoDB / ops

- `docker-compose.yml` only defines optional `mongodb` (Mongo 7 + healthcheck)
- Local MongoDB via `mongodb-community@7.0` is the documented default

### Documentation cleanup

- Added this changelog and a docs index
- Canonical API doc: `api-contract.md` (removed incomplete duplicate `api.md`)
- Architecture updated to describe **current checkpoint** vs **planned** Jac wiring
- Main `README.md` focused on checkpoint-one run instructions

### CI

- Root workflow `.github/workflows/lifeline-ci.yml` compiles and tests the thin backend (no Jac runtime install required for checkpoint one)

## What did *not* change (intentionally)

- No real Jac walker invocation
- No humanitarian / decision logic in Python
- No frontend feature work in this checkpoint
- No scenario loading or report ingestion API

Existing `jac/` and `frontend/` trees remain in the repo for later milestones.

## How to verify

```bash
cd lifeline
cp .env.example .env

# MongoDB (Homebrew)
brew services start mongodb-community@7.0

cd backend
source .venv/bin/activate   # or create venv first
uvicorn app.main:app --reload --port 8001

curl http://localhost:8001/
curl http://localhost:8001/health
```

Healthy health payload:

```json
{
  "status": "healthy",
  "service": "lifeline-api",
  "jac": { "status": "healthy" },
  "mongodb": { "status": "healthy" }
}
```

Note: Jac `healthy` here means the **mocked bridge** is up — not that real Jac walkers ran.

## Recommended commit message

```text
Initialize Lifeline integration architecture
```

## Next milestone (not done here)

Wire `JacBridge` to the real Jac runtime, restore scenario / report routes as thin spawn wrappers, and connect the dashboard — still without moving decision logic into FastAPI.
