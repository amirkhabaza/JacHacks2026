# Lifeline

**Jac-first humanitarian crisis intelligence platform.**

Lifeline helps responders reason over conflicting crisis reports using a Jac object-spatial graph. **Jac is the core technology.** Python (FastAPI) is only a thin integration layer. MongoDB is a supporting store.

> JacHacks 2026 · **Checkpoint one** complete — see [`docs/CHANGES.md`](docs/CHANGES.md) for what changed.

---

## Quick links

| Doc | Why read it |
| --- | ----------- |
| [`docs/CHANGES.md`](docs/CHANGES.md) | Checkpoint-one changelog (start here for recent work) |
| [`docs/README.md`](docs/README.md) | Docs index |
| [`docs/api-contract.md`](docs/api-contract.md) | `/` and `/health` contract |
| [`docs/architecture.md`](docs/architecture.md) | Jac-first architecture |
| [`backend/README.md`](backend/README.md) | Backend layout and run notes |

---

## Checkpoint status

| Item | Status |
| ---- | ------ |
| Repository structure | Done |
| MongoDB connectivity | Done (local MongoDB preferred) |
| FastAPI bridge boots | Done |
| `GET /health` (MongoDB + mocked Jac bridge) | Done |
| Real Jac walkers / scenarios | Later |
| Frontend dashboard | Later |

---

## Folder structure

```text
lifeline/
├── jac/                 # Jac graph engine (core product)
├── frontend/            # Next.js dashboard (later)
├── backend/             # Thin FastAPI ↔ Jac bridge
├── docs/                # CHANGES, API, architecture, demo notes
├── sample_data/         # Disaster fixtures (later)
├── .github/workflows/   # Placeholder (CI lives at repo root today)
├── README.md
├── .gitignore
├── .env.example
└── docker-compose.yml   # Optional MongoDB fallback
```

---

## Local setup (no Docker)

```bash
cp .env.example .env
```

`.env.example` points at local MongoDB:

```env
MONGODB_URI=mongodb://localhost:27017
```

### MongoDB (Homebrew)

```bash
brew tap mongodb/brew
brew trust mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
mongosh --eval 'db.runCommand({ ping: 1 })'
```

### Backend

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Use another port if `8000` / `8001` is already taken.

### Health check

```bash
curl http://localhost:8001/health
```

```json
{
  "status": "healthy",
  "service": "lifeline-api",
  "jac": { "status": "healthy" },
  "mongodb": { "status": "healthy" }
}
```

Jac `healthy` means the **mocked bridge** responded — not that real walkers ran.

---

## Optional: MongoDB via Docker

Not required. If you prefer Compose:

```bash
docker compose up -d mongodb
```

Keep `MONGODB_URI=mongodb://localhost:27017` when the backend runs on the host.

---

## Next milestone

Wire `JacBridge` to the real Jac runtime and expose thin report/scenario routes — without moving decision logic into FastAPI.

Full changelog: [`docs/CHANGES.md`](docs/CHANGES.md)
