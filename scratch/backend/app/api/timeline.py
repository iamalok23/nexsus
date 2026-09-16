"""Timeline API router for chronologically correlated investigation events."""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.utils.database import get_db
from app.schemas.timeline import TimelineEventResponse, TimelineEventCreate
from app.services.timeline_service import timeline_service
from app.utils.auth import get_current_user

router = APIRouter(prefix="/timeline", tags=["Timeline"])


@router.get(
    "",
    response_model=List[TimelineEventResponse],
    summary="Get Chronological Investigation Timeline",
    description="Retrieve chronologically ordered intelligence events across wiretaps, sightings, and warrants."
)
async def get_timeline_events(
    case_id: Optional[str] = Query("case-sih-01", description="Filter events by case ID"),
    category: Optional[str] = Query(None, description="Filter by event category (wiretap, financial, sighting, warrant, arrest)"),
    entity_id: Optional[str] = Query(None, description="Filter by entity ID"),
    search: Optional[str] = Query(None, description="Keyword search in events"),
    db: Session = Depends(get_db)
):
    return timeline_service.list_events(
        case_id=case_id,
        category=category,
        entity_id=entity_id,
        search=search,
        db=db
    )


@router.post(
    "",
    response_model=TimelineEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Timeline Intelligence Event",
    description="Manually record or associate a new event on the investigation timeline."
)
async def create_timeline_event(
    event_in: TimelineEventCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return timeline_service.create_event(event_in, db=db)
