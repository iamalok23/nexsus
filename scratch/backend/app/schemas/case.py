"""Pydantic schemas for Cases."""
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class CaseStatus(str, Enum):
    ACTIVE = "Active Investigation"
    CHARGESHEET = "Chargesheet Filed"
    SURVEILLANCE = "Surveillance Phase"
    INTERDICTION = "Interdiction Imminent"
    CLOSED = "Closed"


class PriorityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"


class CaseBase(BaseModel):
    title: str = Field(..., example="Operation Chakravyuh")
    description: str = Field(
        ...,
        example="Synthetic investigation into inter-state freight transit and transactional anomaly correlation across Delhi NCR and Uttar Pradesh."
    )
    code_name: str = Field(..., alias="codeName", example="CHAKRAVYUH")
    priority: PriorityLevel = Field(default=PriorityLevel.CRITICAL)
    lead_investigator: str = Field(..., alias="leadInvestigator", example="ACP Vikramaditya Rathore")
    agency: str = Field(default="Special Cell, Delhi Police / UP STF", example="Special Cell, Delhi Police / UP STF")
    jurisdiction: str = Field(default="Delhi NCR / Uttar Pradesh Crime Corridor", example="Delhi NCR / Uttar Pradesh Crime Corridor")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class CaseCreate(CaseBase):
    status: CaseStatus = Field(default=CaseStatus.ACTIVE)
    case_number: Optional[str] = Field(None, alias="caseNumber", example="CASE-2026-NCR-09")


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    code_name: Optional[str] = Field(None, alias="codeName")
    priority: Optional[PriorityLevel] = None
    lead_investigator: Optional[str] = Field(None, alias="leadInvestigator")
    agency: Optional[str] = None
    jurisdiction: Optional[str] = None
    status: Optional[CaseStatus] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class CaseStatusUpdate(BaseModel):
    status: CaseStatus = Field(..., example=CaseStatus.ACTIVE)

    model_config = ConfigDict(populate_by_name=True)


class CaseAssignUpdate(BaseModel):
    lead_investigator: str = Field(..., alias="leadInvestigator", example="ACP Vikramaditya Rathore")

    model_config = ConfigDict(populate_by_name=True)


class CaseEntityLinkRequest(BaseModel):
    entity_id: str = Field(..., alias="entityId", example="ent-1")
    role_in_case: Optional[str] = Field(default="Subject of Interest", alias="roleInCase", example="Primary Coordinator")

    model_config = ConfigDict(populate_by_name=True)


class CaseResponse(CaseBase):
    id: str = Field(..., example="case-sih-01")
    case_number: str = Field(..., alias="caseNumber", example="CASE-2026-NCR-09")
    status: CaseStatus = Field(default=CaseStatus.ACTIVE)
    opened_date: str = Field(..., alias="openedDate", example="2026-06-15")
    last_updated: str = Field(..., alias="lastUpdated", example="2026-09-08T00:00:00Z")
    warrants_issued: int = Field(default=0, alias="warrantsIssued")
    assets_seized: str = Field(default="₹0", alias="assetsSeized")
    entities_count: int = Field(default=0, alias="entitiesCount")
    evidence_count: int = Field(default=0, alias="evidenceCount")
    risk_index: int = Field(default=50, alias="riskIndex")
    dataset_label: str = Field(default="Synthetic Investigation Dataset")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
