from fastapi import APIRouter

from app.api.routes import analysis, audit, capa, documents, health, investigations, root_causes

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(investigations.router, prefix="/investigations", tags=["investigations"])
api_router.include_router(documents.router, prefix="/investigations", tags=["documents"])
api_router.include_router(analysis.router, prefix="/investigations", tags=["analysis"])
api_router.include_router(audit.router, prefix="/investigations", tags=["audit"])
api_router.include_router(root_causes.router, prefix="/root-causes", tags=["root-causes"])
api_router.include_router(capa.router, prefix="/capa", tags=["capa"])
