"""Pydantic schemas for Entities."""
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class EntityType(str, Enum):
    SUBJECT_OF_INTEREST = "subject_of_interest"
    SUSPECT = "suspect"  # Supported for frontend schema compatibility
    ORGANIZATION = "organization"
    SHELL_COMPANY = "shell_company"
    VEHICLE = "vehicle"
    BURNER_PHONE = "burner_phone"
    BANK_ACCOUNT = "bank_account"
    SAFEHOUSE = "safehouse"


class RiskLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    ELEVATED = "ELEVATED"
    LOW = "LOW"


class LocationData(BaseModel):
    name: str = Field(..., example="Sector 18 Commercial Hub")
    city: str = Field(..., example="Noida")
    lat: float = Field(..., example=28.5708)
    lng: float = Field(..., example=77.3261)
    timestamp: str = Field(..., example="2026-09-07T12:00:00Z")

    model_config = ConfigDict(populate_by_name=True)


class EntityDetails(BaseModel):
    known_associates_count: int = Field(default=0, alias="knownAssociatesCount")
    total_financial_flow: str = Field(default="₹0", alias="totalFinancialFlow")
    wiretaps_count: int = Field(default=0, alias="wiretapsCount")
    dob: Optional[str] = None
    pob: Optional[str] = None
    wanted_for: Optional[List[str]] = Field(default=None, alias="wantedFor")

    model_config = ConfigDict(populate_by_name=True)


class EntityResponse(BaseModel):
    id: str = Field(..., example="ent-1")
    name: str = Field(..., example="Rahul Verma")
    type: EntityType = Field(default=EntityType.SUBJECT_OF_INTEREST)
    risk_score: int = Field(..., alias="riskScore", example=88)
    risk_level: RiskLevel = Field(..., alias="riskLevel", example=RiskLevel.CRITICAL)
    status: str = Field(..., example="Requires Human Review")
    aliases: List[str] = Field(default_factory=list)
    primary_affiliation: str = Field(default="", alias="primaryAffiliation", example="Apex Logistics Front")
    role: str = Field(default="", example="Primary Coordinator")
    phone_masked: Optional[str] = Field(None, alias="phoneMasked", example="+91 98XXXXXX21")
    vehicle_number: Optional[str] = Field(None, alias="vehicleNumber", example="UP14 AB 1234")
    city: str = Field(..., example="Delhi")
    nationality: Optional[str] = Field("Indian", example="Indian")
    photo: Optional[str] = None
    last_known_location: Optional[LocationData] = Field(None, alias="lastKnownLocation")
    tags: List[str] = Field(default_factory=list)
    details: EntityDetails = Field(default_factory=EntityDetails)
    dataset_label: str = Field(default="Synthetic Investigation Dataset")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
