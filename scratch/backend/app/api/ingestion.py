"""Data Ingestion API router."""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, Query, HTTPException, status
import csv
import json
import io

from app.schemas.ingestion import CDRRecord, FASTagRecord, FinancialRecord, IngestionResponse
from app.services.ingestion_service import ingestion_service
from app.utils.database import SessionLocal
from app.models.interaction import InteractionModel
from app.models.relationship import RelationshipModel
from app.models.timeline import TimelineEventModel

router = APIRouter(prefix="/ingest", tags=["Ingestion"])


@router.post(
    "/cdr",
    response_model=IngestionResponse,
    summary="Ingest CDR Records",
    description="Ingest, validate, normalize, and match telephony Call Detail Records (CDRs)."
)
async def ingest_cdr(
    records: List[CDRRecord],
    case_id: str = Query("case-sih-01", alias="caseId", description="Target investigation case ID")
):
    raw_dicts = [r.model_dump() for r in records]
    return ingestion_service.ingest_cdr_records(raw_dicts, case_id=case_id)


@router.post(
    "/fastag",
    response_model=IngestionResponse,
    summary="Ingest FASTag Records",
    description="Ingest, normalize vehicle plates, and cross-reference ANPR toll plaza sightings."
)
async def ingest_fastag(
    records: List[FASTagRecord],
    case_id: str = Query("case-sih-01", alias="caseId", description="Target investigation case ID")
):
    raw_dicts = [r.model_dump() for r in records]
    return ingestion_service.ingest_fastag_records(raw_dicts, case_id=case_id)


@router.post(
    "/file",
    response_model=IngestionResponse,
    summary="Upload & Ingest Structured Data File",
    description="Upload CSV or JSON file containing CDR, FASTag, or Financial ledger records."
)
async def ingest_file(
    file: UploadFile = File(...),
    file_type: str = Form(..., description="Format type: 'cdr', 'fastag', or 'financial'"),
    case_id: str = Form("case-sih-01", description="Target investigation case ID")
):
    content = await file.read()
    records: List[Dict[str, Any]] = []

    try:
        if file.filename.endswith(".json"):
            records = json.loads(content.decode("utf-8"))
            if isinstance(records, dict) and "records" in records:
                records = records["records"]
        elif file.filename.endswith(".csv"):
            csv_text = content.decode("utf-8-sig")
            reader = csv.DictReader(io.StringIO(csv_text))
            records = [row for row in reader]
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format. Please upload .csv or .json"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse input file: {str(e)}"
        )

    if file_type.lower() == "cdr":
        return ingestion_service.ingest_cdr_records(records, case_id=case_id, source_file=file.filename)
    elif file_type.lower() == "fastag":
        return ingestion_service.ingest_fastag_records(records, case_id=case_id, source_file=file.filename)
    else:
        # Fallback to general ingestion
        return ingestion_service.ingest_cdr_records(records, case_id=case_id, source_file=file.filename)


@router.get(
    "/stats",
    summary="Get Ingestion Pipeline Statistics",
    description="Retrieve live counts of raw interactions, synthesized relationships, and timeline events."
)
async def get_ingestion_stats():
    db = SessionLocal()
    try:
        interactions_count = db.query(InteractionModel).count()
        calls_count = db.query(InteractionModel).filter(InteractionModel.interaction_type == "call").count()
        sightings_count = db.query(InteractionModel).filter(InteractionModel.interaction_type == "vehicle_sighting").count()
        relationships_count = db.query(RelationshipModel).count()
        timeline_count = db.query(TimelineEventModel).count()

        return {
            "status": "active",
            "interactionsTotal": interactions_count,
            "callRecords": calls_count,
            "vehicleSightings": sightings_count,
            "synthesizedRelationships": relationships_count,
            "timelineEvents": timeline_count,
            "pipelineHealth": "operational"
        }
    finally:
        db.close()
