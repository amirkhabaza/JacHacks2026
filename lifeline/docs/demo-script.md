# Lifeline Demo Script (≈5 minutes)

## Setup (before judges arrive)

```bash
# Terminal A — examples warm-up
cd lifeline/jac && jac run examples/06_multi_walker_orchestration.jac

# Terminal B — API
cd lifeline/backend && uvicorn app.main:app --port 8000

# Terminal C — UI
cd lifeline/frontend && npm run dev
```

Open http://localhost:3000

## Narrative

1. **Hook (30s)**  
   “When disasters hit, responders get conflicting reports. Lifeline treats the crisis as a Jac graph — walkers are the intelligence.”

2. **Show the repo (45s)**  
   Open `jac/walkers/` and `jac/nodes/`. Emphasize: *not a Python app with Jac added*.

3. **Runnable Jac proof (60s)**  
   Run `jac run examples/03_edge_creation.jac` and `examples/02_node_traversal.jac`.  
   Line: “This is the same model Lifeline uses for corroborates / contradicts and cascade traversal.”

4. **Live dashboard (90s)**  
   - Click **Earthquake**  
   - Ingest sensor report: bridge collapsed  
   - Ingest anonymous report: bridge open  
   - Point at React Flow contradiction edge + confidence drop  
   - Show allocation: generator → hospital, oxygen → shelter, ambulance assigned  

5. **Walker timeline (45s)**  
   Walk the right-hand timeline: ingest → verify → propagate → allocate → explain.

6. **Close (30s)**  
   “The graph is the source of truth. Python only bridges HTTP. Jac owns the crisis logic.”

## Backup if LLM keys missing

Skip live `by llm()`; show `jac/llm/extract_entities.jac` source and run non-LLM examples 01–04 and 06.
