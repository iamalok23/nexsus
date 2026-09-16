"""Cases API router."""
from typing import List, Optional
from fastapi import APIRouter, Query, status
from app.schemas.case import (
    CaseResponse,
    CaseCreate,
    CaseUpdate,
    CaseStatusUpdate,
    CaseAssignUpdate,
    CaseEntityLinkRequest
)
from app.schemas.entity import EntityResponse
from app.services.case_service import case_service

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.get(
    "",
    response_model=List[CaseResponse],
    summary="List All Investigation Cases",
    description="Retrieve all synthetic cases in the system with optional status, priority, or keyword filters."
)
async def list_cases(
    status: Optional[str] = Query(None, description="Filter by case status (e.g., 'Active Investigation')"),
    priority: Optional[str] = Query(None, description="Filter by priority level ('CRITICAL', 'HIGH', 'MEDIUM')"),
    search: Optional[str] = Query(None, description="Search by title, description, or code name")
):
    return case_service.get_cases(status=status, priority=priority, search=search)


@router.get(
    "/{case_id}",
    response_model=CaseResponse,
    summary="Get Case Details by ID",
    description="Retrieve full details for a specific synthetic investigation case."
)
async def get_case(case_id: str):
    return case_service.get_case_by_id(case_id)


@router.post(
    "",
    response_model=CaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Investigation Case",
    description="Register a new synthetic case within the prototype investigation registry."
)
async def create_case(case_in: CaseCreate):
    return case_service.create_case(case_in)


@router.put(
    "/{case_id}",
    response_model=CaseResponse,
    summary="Update Case Details",
    description="Update metadata, jurisdiction, or status of an existing investigation case."
)
async def update_case(case_id: str, case_update: CaseUpdate):
    return case_service.update_case(case_id, case_update)


@router.patch(
    "/{case_id}/status",
    response_model=CaseResponse,
    summary="Update Case Status",
    description="Update the operational status of an active investigation case."
)
async def update_case_status(case_id: str, status_in: CaseStatusUpdate):
    return case_service.update_case_status(case_id, status_in.status.value if hasattr(status_in.status, "value") else str(status_in.status))


@router.patch(
    "/{case_id}/assign",
    response_model=CaseResponse,
    summary="Assign Lead Investigator",
    description="Assign or reassign the lead investigating officer to a case."
)
async def assign_investigator(case_id: str, assign_in: CaseAssignUpdate):
    return case_service.assign_investigator(case_id, assign_in.lead_investigator)


@router.get(
    "/{case_id}/entities",
    response_model=List[EntityResponse],
    summary="Get Case Entities",
    description="Retrieve all monitored entities and suspects associated with a case."
)
async def get_case_entities(case_id: str):
    return case_service.get_case_entities(case_id)


@router.post(
    "/{case_id}/entities",
    summary="Link Entity to Case",
    description="Associate an entity or suspect with an investigation case as an investigative lead."
)
async def link_entity_to_case(case_id: str, link_in: CaseEntityLinkRequest):
    case_service.link_entity(case_id, link_in.entity_id, link_in.role_in_case or "Subject of Interest")
    return {"status": "success", "message": f"Entity {link_in.entity_id} linked to {case_id}"}


@router.delete(
    "/{case_id}/entities/{entity_id}",
    summary="Unlink Entity from Case",
    description="Remove an association between an entity and an investigation case."
)
async def unlink_entity_from_case(case_id: str, entity_id: str):
    case_service.unlink_entity(case_id, entity_id)
    return {"status": "success", "message": f"Entity {entity_id} unlinked from {case_id}"}
