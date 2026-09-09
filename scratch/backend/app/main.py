"""NEXUS Backend Application Entrypoint.

FastAPI backend for law enforcement intelligence analysis prototype.
Configured with CORS for React frontend, centralized error handling,
NetworkX graph analysis, and OpenAPI docs.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.utils.config import settings
from app.utils.database import Base, engine
from app.utils.errors import register_error_handlers
from app.api.router import api_router
from app.api.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context: initialize SQLite tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "## NEXUS Intelligence & Investigation Analysis Platform API\n\n"
        "**Ethical Prototype Notice**:\n"
        "- Uses purely synthetic Indian investigation data ('Operation Chakravyuh').\n"
        "- Graph construction and topological metrics powered by **NetworkX**.\n"
        "- All analytical findings and pattern detections are risk indicators requiring human analyst review.\n"
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# 1. Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Register Centralized Error Handlers
register_error_handlers(app)

# 3. Mount Routers
# /health directly accessible as requested: GET /health
app.include_router(health_router)

# /api/* endpoints
app.include_router(api_router)


@app.get("/", include_in_schema=False)
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs",
        "health": "/health",
        "dataset": settings.DATASET_LABEL
    }
