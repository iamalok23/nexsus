"""Pydantic schemas for File Upload and Evidence Ingestion."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class ExtractedEntityMatch(BaseModel):
    name: str = Field(..., example="Amit Yadav")
    type: str = Field(..., example="subject_of_interest")
    matched_text: str = Field(..., example="Amit Yadav")
    indicator_type: str = Field(..., example="named_entity")

    model_config = ConfigDict(populate_by_name=True)


class ExtractedData(BaseModel):
    summary: str = Field(..., example="Automated synthetic extraction found 2 entity references and 1 vehicle registration.")
    entities: List[ExtractedEntityMatch] = Field(default_factory=list)
    phone_numbers: List[str] = Field(default_factory=list, alias="phoneNumbers", example=["+91 97XXXXXX45"])
    vehicle_numbers: List[str] = Field(default_factory=list, alias="vehicleNumbers", example=["UP14 AB 1234"])
    currency_amounts: List[str] = Field(default_factory=list, alias="currencyAmounts", example=["₹12,50,000"])
    extraction_tags: List[str] = Field(default_factory=list, alias="extractionTags")
    extraction_engine: str = Field(default="Rule-Based Prototype (Upgrade path: spaCy / Gemini API)")

    model_config = ConfigDict(populate_by_name=True)


class FileDetails(BaseModel):
    filename: str = Field(..., example="FASTAG_JEWAR_LOGS_SYNTH.csv")
    size_bytes: int = Field(..., alias="sizeBytes", example=18432)
    size_formatted: str = Field(..., alias="sizeFormatted", example="18.0 KB")
    format: str = Field(..., example="csv")
    mime_type: Optional[str] = Field(None, alias="mimeType", example="text/csv")

    model_config = ConfigDict(populate_by_name=True)


class UploadResponse(BaseModel):
    id: str = Field(..., example="ev-synth-04")
    evidence_number: str = Field(..., alias="evidenceNumber", example="EV-2026-SYNTH-04")
    case_id: str = Field(..., alias="caseId", example="case-sih-01")
    case_name: str = Field(default="Operation Chakravyuh", alias="caseName")
    title: str = Field(..., example="Uploaded FASTag Transit File")
    hash_sha256: str = Field(..., alias="hashSHA256", example="3e4c022f46e896472d0012d98f7e6f8b1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e")
    file_details: FileDetails = Field(..., alias="fileDetails")
    extraction: ExtractedData
    review_status: str = Field(default="Requires Human Review", alias="reviewStatus")
    dataset_label: str = Field(default="Synthetic Investigation Dataset")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
