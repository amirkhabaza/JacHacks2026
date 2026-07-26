# Lifeline — Devpost Draft

## Tagline

Crisis intelligence on a Jac graph: verify reports, predict cascades, allocate aid.

## Inspiration

Emergency operations centers still reconcile rumors in spreadsheets while infrastructure failures cascade silently. We wanted a system where conflicting claims and dependencies are *native* — not bolted onto a relational CRUD app.

## What it does

Lifeline ingests free-text crisis reports, extracts entities with Jac `by llm()`, builds an object-spatial graph, verifies corroboration vs contradiction, propagates infrastructure failures along `depends_on`, allocates resources, and explains decisions to operators on a live React Flow dashboard.

## How we built it

- **Jac** for nodes, edges, walkers, and LLM functions (core product)
- **FastAPI** as a thin bridge (no business logic)
- **Next.js + React Flow** for live graph visualization
- **MongoDB** for optional audit mirroring

## Challenges

Keeping Python honest — resisting the urge to implement scoring in the API layer. Designing edge semantics rich enough for both verification and logistics.

## Accomplishments

- Jac-first monorepo scaffold aligned to judging rubrics
- Full walker pipeline stubs + educational `jac/examples`
- Operator dashboard wired to the intended API surface

## What we learned

Object-spatial programming maps naturally onto disaster systems: failures *walk* dependency edges the same way aid *walks* supply edges.

## What's next

Complete walker implementations, WebSocket traversal streaming, SMS ingest, and multi-region incidents.

## Built with

Jac, byllm, Python, FastAPI, Next.js, TypeScript, Tailwind CSS, React Flow, MongoDB, Docker
