# Lifeline backend

Thin FastAPI bridge for Lifeline. **No crisis decision logic lives here.**

```text
app/
├── main.py           # App factory, lifespan, CORS, GET /
├── config.py         # Pydantic Settings
├── dependencies.py   # MongoDB + JacBridge from app.state
├── api/health.py     # GET /health
├── schemas/          # Response models
└── services/
    ├── mongodb.py    # Motor client
    └── jac_bridge.py # Mocked Jac adapter (checkpoint one)
```

## Run

```bash
# from lifeline/
cp .env.example .env

cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Requires MongoDB on `localhost:27017` for a fully healthy `/health` response.

More context: [`../docs/CHANGES.md`](../docs/CHANGES.md)
