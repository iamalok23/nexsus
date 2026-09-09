"""Central API Router aggregating all sub-routers under /api."""
from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.cases import router as cases_router
from app.api.network import router as network_router
from app.api.entities import router as entities_router
from app.api.insights import router as insights_router
from app.api.upload import router as upload_router

api_router = APIRouter(prefix="/api")

# Mount endpoints under /api
api_router.include_router(cases_router)
api_router.include_router(network_router)
api_router.include_router(entities_router)
api_router.include_router(insights_router)
api_router.include_router(upload_router)
api_router.include_router(health_router)  # Also available at /api/health
