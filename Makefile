.PHONY: install db db-shell db-reset migrate migration seed backend frontend build test lint up down

PY := backend/.venv/bin/python

install:
	cd backend && python3 -m venv .venv && .venv/bin/pip install -e ".[dev]"
	cd frontend && npm install

db:              ## start only PostgreSQL and wait until healthy
	docker compose up -d --wait db

db-shell:        ## psql into the container
	docker compose exec db psql -U $${POSTGRES_USER:-rca} -d $${POSTGRES_DB:-rca}

db-reset:        ## wipe the DB volume, then re-create schema + demo users
	docker compose down -v db
	$(MAKE) db migrate seed

migration:       ## make migration m="message"
	cd backend && .venv/bin/alembic revision --autogenerate -m "$(m)"

migrate:
	cd backend && .venv/bin/alembic upgrade head

seed:
	cd backend && .venv/bin/python -m app.seed

backend:         ## FastAPI with reload on :8000
	cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000

frontend:        ## Vite dev server on :5173 (proxies /api → :8000)
	cd frontend && npm run dev

build:           ## build SPA into backend/app/static (single deployable)
	cd frontend && npm run build

test:
	cd backend && .venv/bin/pytest -q

lint:
	cd backend && .venv/bin/ruff check app tests
	cd frontend && npm run typecheck

up:
	docker compose up --build

down:
	docker compose down
