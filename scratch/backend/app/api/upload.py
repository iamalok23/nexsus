"""Upload API router."""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.schemas.upload import UploadResponse
from app.services.upload_service import upload_service

router = APIRouter(prefix="/upload", tags=["Evidence Ingestion"])


@router.post(
    "",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and Process Evidence File",
    description=(
        "Upload a synthetic evidence file for ingestion. Restricted to **TXT, CSV, and JSON** formats. "
        "Computes the SHA-256 cryptographic hash, stores file metadata into SQLite database, and performs "
        "modular entity/pattern extraction."
    )
)
async def upload_evidence(
    file: UploadFile = File(..., description="Evidence file (TXT, CSV, or JSON only)"),
    case_id: Optional[str] = Form("case-sih-01", description="Associated case ID"),
    title: Optional[str] = Form(None, description="Optional custom title for the evidence item"),
    classification: Optional[str] = Form("LAW ENFORCEMENT SENSITIVE", description="Security classification"),
    db: Session = Depends(get_db)
):
    return await upload_service.process_upload(
        file=file,
        case_id=case_id,
        title=title,
        classification=classification,
        db=db
    )


@router.get(
    "",
    summary="List Persisted Evidence Records",
    description="Retrieve all evidence items persisted in the SQLite database."
)
async def list_evidence(
    case_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return upload_service.get_all_evidence(case_id=case_id, db=db)
