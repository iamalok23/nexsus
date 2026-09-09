"""Common schemas and response models."""
from datetime import datetime, timezone
from typing import Optional, Any
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy")
    service: str = Field(..., example="NEXUS Intelligence API")
    version: str = Field(..., example="1.0.0")
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        example="2026-09-08T01:54:00Z"
    )
    dataset: str = Field("Synthetic Investigation Dataset", description="Dataset compliance attribution")
    active_cases: int = Field(1, description="Active synthetic cases count")


class ErrorDetail(BaseModel):
    type: str
    message: str
    details: Optional[Any] = None


class APIResponseEnvelope(BaseModel):
    success: bool = True
    dataset: str = "Synthetic Investigation Dataset"
    data: Optional[Any] = None
    error: Optional[ErrorDetail] = None
