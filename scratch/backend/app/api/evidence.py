"""Evidence API router for retrieving investigation evidence records."""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.services.upload_service import upload_service

router = APIRouter(prefix="/evidence", tags=["Evidence"])


@router.get(
    "",
    summary="List All Evidence Records",
    description="Retrieve all evidence records persisted in SQLite database (with fallback to default seed evidence)."
)
async def list_evidence(
    case_id: Optional[str] = Query(None, description="Optional filter by case ID"),
    db: Session = Depends(get_db)
):
    return upload_service.get_all_evidence(case_id=case_id, db=db)


@router.get(
    "/{evidence_id}",
    summary="Get Evidence Item by ID",
    description="Retrieve complete dossier and extraction metadata for a specific evidence item."
)
async def get_evidence_item(
    evidence_id: str,
    db: Session = Depends(get_db)
):
    item = upload_service.get_evidence_by_id(evidence_id=evidence_id, db=db)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence record with ID '{evidence_id}' was not found in the investigation vault."
        )
    return item
