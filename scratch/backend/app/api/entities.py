"""Entities API router."""
from typing import List, Optional
from fastapi import APIRouter, Query
from app.schemas.entity import EntityResponse
from app.services.entity_service import entity_service

router = APIRouter(prefix="/entities", tags=["Entities"])


@router.get(
    "",
    response_model=List[EntityResponse],
    summary="List Tracked Entities",
    description="Retrieve all synthetic subjects and entities monitored across corridors."
)
async def list_entities(
    city: Optional[str] = Query(None, description="Filter entities by city (e.g., 'Delhi', 'Lucknow')")
):
    return entity_service.list_entities(city=city)


@router.get(
    "/{entity_id}",
    response_model=EntityResponse,
    summary="Get Entity Profile by ID",
    description="Retrieve full dossier, risk indicators, and recent location for a specific synthetic entity."
)
async def get_entity(entity_id: str):
    return entity_service.get_entity_by_id(entity_id)
