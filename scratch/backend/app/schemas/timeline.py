"""Pydantic schemas for Timeline Events."""
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class TimelineEventBase(BaseModel):
    title: str = Field(..., example="Wiretap Intercept: Hawala Handover Call")
    description: str = Field(..., example="Call between RV and AY confirming bullion pickup at Chandni Chowk.")
    category: str = Field(default="wiretap", example="wiretap")  # wiretap, financial, sighting, warrant, arrest, intel
    location: str = Field(..., example="Chandni Chowk, Old Delhi")
    city: Optional[str] = Field(default="Delhi", example="Delhi")
    timestamp: str = Field(..., example="2026-09-07 14:32 IST")
    entity_ids: List[str] = Field(default_factory=list, alias="entityIds")
    entity_names: List[str] = Field(default_factory=list, alias="entityNames")
    confidence_score: int = Field(default=85, alias="confidenceScore")
    source_citation: Optional[str] = Field(None, alias="sourceCitation")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class TimelineEventCreate(TimelineEventBase):
    case_id: Optional[str] = Field(default="case-sih-01", alias="caseId")
    evidence_id: Optional[str] = Field(None, alias="evidenceId")


class TimelineEventResponse(TimelineEventBase):
    id: str = Field(..., example="time-1")
    case_id: str = Field(..., alias="caseId", example="case-sih-01")
    evidence_id: Optional[str] = Field(None, alias="evidenceId")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
