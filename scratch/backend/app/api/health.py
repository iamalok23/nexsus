"""Health check router."""
from fastapi import APIRouter
from app.schemas.common import HealthResponse
from app.utils.config import settings
from app.services.mock_data import SYNTHETIC_DATASET_LABEL

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service Health Check",
    description="Returns the operational status of the NEXUS Intelligence API and dataset compliance metadata."
)
async def health_check():
    return HealthResponse(
        status="healthy",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        dataset=SYNTHETIC_DATASET_LABEL,
        active_cases=1
    )
