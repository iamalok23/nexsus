"""Cases API router."""
from typing import List, Optional
from fastapi import APIRouter, Query, status
from app.schemas.case import CaseResponse, CaseCreate
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
