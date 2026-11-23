# AI-Assisted RCA Module

AI-assisted Root Cause Analysis for API (Active Pharmaceutical Ingredient) manufacturing
deviations: **Deviation → RCA → CAPA**. *The AI reads and drafts. The human checks and decides.*

- Requirements: [docs/requirements.md](docs/requirements.md)
- Architecture and code map: [docs/architecture.md](docs/architecture.md)
- UI design system: [docs/design-system.md](docs/design-system.md)

**Stack:** React + Redux Toolkit (RTK Query) · Python + FastAPI · LangGraph + Groq · PostgreSQL

## Project layout

```
.
├── backend/                     # FastAPI app (also serves the built frontend)
│   ├── app/
│   │   ├── main.py              # app factory: /api routers + SPA static serving
│   │   ├── seed.py              # demo investigator + QA approver
│   │   ├── core/                # config, database, security (roles), exceptions, logging
│   │   ├── domain/              # enums + compliance rules (docs §11)
│   │   ├── models/              # SQLAlchemy: users, investigations, documents, causes, capa, audit
│   │   ├── schemas/             # Pydantic request/response models
│   │   ├── api/routes/          # investigations, documents, analysis, root-causes, capa, audit
│   │   ├── services/            # use cases, transactions, audit logging
│   │   ├── parsers/             # PDF / .eml / text → plain text
│   │   ├── ai/                  # LangGraph pipeline
│   │   │   ├── graph.py         # ingest→extract→gap_check→analyze→rank_causes→recommend_capa→human_review→save
│   │   │   ├── nodes/           # one file per step
│   │   │   ├── prompts/         # one prompt per step + shared system rules
│   │   │   ├── schemas.py       # Pydantic models for LLM JSON output
│   │   │   ├── structured.py    # validate + retry once with the error
│   │   │   ├── llm.py           # Groq client (GROQ_MODEL)
│   │   │   └── checkpointer.py  # Postgres checkpoints for the review interrupt
│   │   └── static/              # ← vite build output (gitignored)
│   ├── alembic/                 # DB migrations
│   ├── storage/uploads/         # uploaded source files (gitignored)
│   └── tests/
├── frontend/                    # React + Vite + Redux Toolkit
│   └── src/
│       ├── app/                 # store, typed hooks
│       ├── services/            # RTK Query API (one endpoint per backend route)
│       ├── features/
│       │   ├── investigation/   # slice: current form data + status
│       │   ├── aiDraft/         # slice: original AI output
│       │   ├── aiPanel/         # slice + AI panel UI (input, progress, Ask AI)
│       │   ├── review/          # slice: accept/reject + approval
│       │   └── rcaForm/         # form + tabs: Details, Evidence, Analysis, Root causes, CAPA, Review
│       ├── components/          # UI kit (Button, Field, Tabs, badges, Toast, …) + app shell
│       ├── styles/              # design tokens (light/dark) + component styles
│       ├── pages/               # list, workspace (AI panel beside the form)
│       └── types/
├── samples/DEV-2026-041/        # demo scenario inputs (docs §13)
├── docs/
├── Dockerfile                   # multi-stage: build SPA → Python image serving API + SPA
├── docker-compose.yml           # postgres + app
└── Makefile
```

## Run locally

```bash
cp .env.example .env              # set GROQ_API_KEY
make install
make db                           # PostgreSQL 16 in Docker (postgres:16-alpine, port 5432)
make migrate                      # apply Alembic migrations
make seed                         # demo investigator + QA approver
make backend                      # http://localhost:8000/api/docs
make frontend                     # http://localhost:5173
```

Database helpers: `make db-shell` (psql), `make db-reset` (drop the volume and re-migrate),
`make migration m="..."` after changing models.

## Run as a single container

```bash
docker compose up --build         # http://localhost:8000
```

## Prototype notes

- Groq's free tier allows about 8k tokens/minute. A full analysis of the demo
  (`samples/DEV-2026-041`) takes about 1–2 minutes, because the client waits out
  rate limits (`LLM_MAX_RETRIES`). Provider failures return HTTP 503 with a readable message.
- Auth is a stub: the `X-User-Id` header picks a seeded user (switch users in the header bar).
- Out of scope: 21 CFR Part 11 e-signatures, QMS/LIMS/MES integration, OCR.
