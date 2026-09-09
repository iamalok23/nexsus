"""Insights API router."""
from fastapi import APIRouter
from app.schemas.insight import CaseInsightsResponse
from app.services.insight_service import insight_service

router = APIRouter(prefix="/insights", tags=["AI & Analytical Insights"])


@router.get(
    "/{case_id}",
    response_model=CaseInsightsResponse,
    summary="Get Case AI & Pattern Insights",
    description=(
        "Returns synthesized analytical insights for a case, including algorithmic crime pattern "
        "detections, priority threat alerts, and core investigation metrics."
    )
)
async def get_insights(case_id: str):
    return insight_service.get_case_insights(case_id)
