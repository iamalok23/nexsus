"""Entities API router."""
from typing import List, Optional
from fastapi import APIRouter, Query, status
from app.schemas.entity import EntityResponse, EntityCreate, EntityUpdate
from app.schemas.case import CaseResponse
from app.services.entity_service import entity_service

router = APIRouter(prefix="/entities", tags=["Entities"])


@router.get(
    "",
    response_model=List[EntityResponse],
    summary="List Tracked Entities",
    description="Retrieve all synthetic subjects and entities monitored across corridors with optional filters."
)
async def list_entities(
    city: Optional[str] = Query(None, description="Filter entities by city (e.g., 'Delhi', 'Lucknow')"),
    type: Optional[str] = Query(None, description="Filter by entity type"),
    search: Optional[str] = Query(None, description="Search by name, role, phone, or affiliation")
):
    return entity_service.list_entities(city=city, search=search, entity_type=type)


@router.post(
    "",
    response_model=EntityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Entity Profile",
    description="Register a newly identified person, vehicle, or organization profile."
)
async def create_entity(entity_in: EntityCreate):
    return entity_service.create_entity(entity_in)


@router.get(
    "/{entity_id}",
    response_model=EntityResponse,
    summary="Get Entity Profile by ID",
    description="Retrieve full dossier, risk indicators, and recent location for a specific synthetic entity."
)
async def get_entity(entity_id: str):
    return entity_service.get_entity_by_id(entity_id)


@router.put(
    "/{entity_id}",
    response_model=EntityResponse,
    summary="Update Entity Profile",
    description="Update profile metadata, risk assessment, or surveillance tags for an entity."
)
async def update_entity(entity_id: str, entity_update: EntityUpdate):
    return entity_service.update_entity(entity_id, entity_update)


@router.delete(
    "/{entity_id}",
    summary="Delete Entity Profile",
    description="Remove an entity profile from the active investigation registry."
)
async def delete_entity(entity_id: str):
    entity_service.delete_entity(entity_id)
    return {"status": "success", "message": f"Entity {entity_id} deleted successfully"}


@router.get(
    "/{entity_id}/cases",
    response_model=List[CaseResponse],
    summary="Get Cases Linked to Entity",
    description="Retrieve all active or archived investigation cases associated with this entity."
)
async def get_entity_cases(entity_id: str):
    return entity_service.get_entity_cases(entity_id)
