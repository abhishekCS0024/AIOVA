# Architecture: modular monolith

One repository, one deployable. FastAPI serves the REST API under `/api` and the built
React app at `/`. In development, Vite runs on :5173 and proxies `/api` to FastAPI on :8000.

```
Browser ──► FastAPI (uvicorn)
             ├── /api/*      → api/routes → services → domain/rules → models → PostgreSQL
             │                                   └──► ai/graph (LangGraph) ──► Groq
             │                                   └──► parsers (PDF / email / text)
             └── /*          → app/static (vite build output, SPA fallback)
```

## Backend layering (`backend/app`)

| Package | Responsibility | Depends on |
|---|---|---|
| `api/` | HTTP: routing, request/response schemas, auth deps. No business logic. | services, schemas |
| `services/` | Use cases: create, edit, analyze, confirm, approve. Owns transactions + audit. | domain, models, ai, parsers |
| `domain/` | Enums and the compliance rules of docs §11 (pure Python, no I/O). | — |
| `models/` | SQLAlchemy tables (docs §8). | — |
| `schemas/` | Pydantic API contracts. | domain |
| `ai/` | LangGraph pipeline: state, 8 nodes, prompts, structured-output + retry, checkpointer. | domain, schemas |
| `parsers/` | PDF / .eml / text → plain text. | domain |
| `core/` | Settings, DB session, auth, exceptions, logging. | — |

## Requirement → code map

| Requirement (docs §4) | Where |
|---|---|
| PDF / text / email intake | `parsers/`, `api/routes/documents.py`, `frontend/src/features/aiPanel/components/InputSelector.tsx` |
| AI form population | `ai/nodes/extract.py` → `services/analysis_service.py::_apply_draft` |
| 5 Whys + fishbone | `ai/nodes/analyze.py`, `frontend/src/components/analysis/` |
| Ranked causes with evidence | `ai/nodes/rank_causes.py`, `features/rcaForm/tabs/RootCausesTab.tsx` |
| Missing evidence | `ai/nodes/gap_check.py`, `DetailsTab.tsx` |
| CAPA with rationale | `ai/nodes/recommend_capa.py`, `CapaTab.tsx` |
| Review before save | `ai/nodes/human_review.py` (LangGraph `interrupt`), `services/approval_service.py` |
| AI output is a suggestion | `domain/rules.py`, `services/root_cause_service.py` |
| Audit trail | `models/audit_log.py`, `services/audit_service.py` |
