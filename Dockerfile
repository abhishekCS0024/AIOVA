# ---- Stage 1: build the React app ----
FROM node:22-alpine AS frontend
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# vite writes to ../backend/app/static
RUN mkdir -p ../backend/app/static && npm run build

# ---- Stage 2: Python app serving API + SPA ----
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY backend/pyproject.toml ./
COPY backend/app ./app
RUN pip install --no-cache-dir .
COPY backend/alembic.ini ./
COPY backend/alembic ./alembic
COPY --from=frontend /build/backend/app/static ./app/static
RUN mkdir -p storage/uploads
EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
