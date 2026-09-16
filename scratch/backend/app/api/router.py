"""Central API Router aggregating all sub-routers under /api."""
from fastapi import APIRouter, Depends
from app.api.health import router as health_router
from app.api.cases import router as cases_router
from app.api.network import router as network_router
from app.api.entities import router as entities_router
from app.api.insights import router as insights_router
from app.api.upload import router as upload_router
from app.api.evidence import router as evidence_router
from app.api.timeline import router as timeline_router
from app.api.ingestion import router as ingestion_router
from app.utils.auth import get_current_user

api_router = APIRouter(prefix="/api")

# Reusable authentication dependency protecting sensitive investigative endpoints
auth_dependency = [Depends(get_current_user)]

# Protected sensitive routers
api_router.include_router(cases_router, dependencies=auth_dependency)
api_router.include_router(network_router, dependencies=auth_dependency)
api_router.include_router(entities_router, dependencies=auth_dependency)
api_router.include_router(insights_router, dependencies=auth_dependency)
api_router.include_router(upload_router, dependencies=auth_dependency)
api_router.include_router(evidence_router, dependencies=auth_dependency)
api_router.include_router(timeline_router, dependencies=auth_dependency)
api_router.include_router(ingestion_router, dependencies=auth_dependency)

# Public health endpoints (no authentication required)
api_router.include_router(health_router)
