"""Pydantic schemas for Data Ingestion."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class CDRRecord(BaseModel):
    caller: str = Field(..., example="+91 98XXXXXX21")
    receiver: str = Field(..., example="+91 98XXXXXX44")
    timestamp: str = Field(..., example="2026-09-07 14:32:00")
    duration_seconds: Optional[int] = Field(default=120, alias="durationSeconds")
    location: Optional[str] = Field(default="Delhi NCR", example="Indirapuram Node 04")
    city: Optional[str] = Field(default="Delhi", example="Ghaziabad")
    tower_id: Optional[str] = Field(None, alias="towerId", example="NCR-TOWER-092")
    case_id: Optional[str] = Field(default="case-sih-01", alias="caseId")
    evidence_id: Optional[str] = Field(None, alias="evidenceId")

    model_config = ConfigDict(populate_by_name=True)


class FASTagRecord(BaseModel):
    vehicle_number: str = Field(..., alias="vehicleNumber", example="UP14 AB 1234")
    toll_plaza: str = Field(..., alias="tollPlaza", example="Jewar Toll Plaza")
    timestamp: str = Field(..., example="2026-09-07 18:15:00")
    direction: Optional[str] = Field(default="Outbound", example="Outbound")
    city: Optional[str] = Field(default="Noida", example="Jewar")
    case_id: Optional[str] = Field(default="case-sih-01", alias="caseId")
    evidence_id: Optional[str] = Field(None, alias="evidenceId")

    model_config = ConfigDict(populate_by_name=True)


class FinancialRecord(BaseModel):
    account_source: str = Field(..., alias="accountSource", example="Canara Bank #0492")
    account_target: str = Field(..., alias="accountTarget", example="Apex Trans Logistics #8812")
    amount_inr: float = Field(..., alias="amountINR", example=1250000.0)
    timestamp: str = Field(..., example="2026-09-07 11:20:00")
    transaction_type: Optional[str] = Field(default="RTGS", alias="transactionType")
    narrative: Optional[str] = Field(default="", example="Bullion Transit Advance")
    case_id: Optional[str] = Field(default="case-sih-01", alias="caseId")
    evidence_id: Optional[str] = Field(None, alias="evidenceId")

    model_config = ConfigDict(populate_by_name=True)


class IngestionResponse(BaseModel):
    status: str = Field(default="success")
    records_processed: int = Field(default=0, alias="recordsProcessed")
    records_valid: int = Field(default=0, alias="recordsValid")
    records_invalid: int = Field(default=0, alias="recordsInvalid")
    records_duplicated: int = Field(default=0, alias="recordsDuplicated")
    interactions_created: int = Field(default=0, alias="interactionsCreated")
    entities_matched: int = Field(default=0, alias="entitiesMatched")
    relationships_updated: int = Field(default=0, alias="relationshipsUpdated")
    errors: List[str] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)
