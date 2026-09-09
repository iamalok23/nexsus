"""Pydantic schemas for AI and Analytical Insights."""
from enum import Enum
from typing import List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field


class AlertSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    ELEVATED = "ELEVATED"
    ROUTINE = "ROUTINE"


class CrimePattern(BaseModel):
    id: str = Field(..., example="pat-1")
    title: str = Field(..., example="Possible Layered Financial Pattern")
    category: str = Field(..., example="Financial Routing")
    description: str = Field(
        ...,
        example="Sequential transfer of ₹12,50,000 originating in Delhi, routed via Ghaziabad trading account, and deposited into Lucknow commercial account within 6 hours. Requires human review."
    )
    confidence: int = Field(..., example=91)
    involved_entities: List[str] = Field(..., alias="involvedEntities", example=["Rahul Verma", "Amit Yadav", "Priya Singh"])
    locations: List[str] = Field(..., example=["Delhi (Connaught Place)", "Ghaziabad (Indirapuram)", "Lucknow (Hazratganj)"])
    key_metric: str = Field(..., alias="keyMetric", example="₹12,50,000 in 3 sub-transfers")
    severity: AlertSeverity = Field(default=AlertSeverity.HIGH)
    review_status: str = Field(default="Requires Human Review", alias="reviewStatus")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class ThreatAlert(BaseModel):
    id: str = Field(..., example="alt-1")
    timestamp: str = Field(..., example="15 mins ago")
    title: str = Field(..., example="FASTag Alert: Scorpio UP14 AB 1234 on Yamuna Expressway")
    description: str = Field(
        ...,
        example="Vehicle crossed Jewar toll plaza heading towards Lucknow. Associated with Amit Yadav. Requires human review."
    )
    level: AlertSeverity = Field(default=AlertSeverity.HIGH)
    source: str = Field(..., example="FASTag ANPR")
    related_entity_id: Optional[str] = Field(None, alias="relatedEntityId")
    related_entity_name: Optional[str] = Field(None, alias="relatedEntityName")
    city: Optional[str] = None
    confidence: int = Field(default=90)
    is_read: bool = Field(default=False, alias="isRead")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class MetricData(BaseModel):
    id: str = Field(..., example="m-1")
    title: str = Field(..., example="Tracked Persons of Interest")
    value: Union[str, int] = Field(..., example="7 Profiles")
    change: str = Field(..., example="2 Priority Indicators")
    trend: str = Field(default="neutral", example="neutral")
    threat: str = Field(default="neutral", example="high")
    subtext: str = Field(..., example="Corridor entities requiring review")
    sparkline: Optional[List[int]] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class CaseInsightsResponse(BaseModel):
    case_id: str = Field(..., alias="caseId")
    case_title: str = Field(..., alias="caseTitle", example="Operation Chakravyuh")
    summary: str = Field(
        ...,
        example="Synthetic analytical overview: Multi-node corridor analysis indicates transactional convergence in Lucknow and highway transit correlations across NCR."
    )
    patterns: List[CrimePattern]
    alerts: List[ThreatAlert]
    metrics: List[MetricData]
    dataset_label: str = Field(default="Synthetic Investigation Dataset")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
