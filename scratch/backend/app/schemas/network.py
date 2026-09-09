"""Pydantic schemas for Network Graph."""
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.entity import EntityType


class EdgeRelationship(str, Enum):
    FINANCIAL_TRANSFER = "financial_transfer"
    HAWALA_TRANSFER = "hawala_transfer"
    COMMERCIAL_ASSOCIATE = "commercial_associate"
    KNOWN_ASSOCIATE = "known_associate"
    LOGISTICS_COORDINATION = "logistics_coordination"
    BANKING_DEPOSIT = "banking_deposit"
    BANKING_WITHDRAWAL = "banking_withdrawal"
    REGISTERED_KEEPER = "registered_keeper"
    VEHICLE_REGISTERED = "vehicle_registered"
    TRANSIT_OBSERVATION = "transit_observation"
    COURIER = "courier"
    TELECOM_CONTACT = "telecom_contact"
    PHONE_CALL = "phone_call"
    BUSINESS_CONTACT = "business_contact"
    DIRECTOR = "director"
    SAFEHOUSE_ACCESS = "safehouse_access"


class GraphNode(BaseModel):
    id: str = Field(..., example="ent-1")
    label: str = Field(..., example="Rahul Verma")
    type: EntityType = Field(default=EntityType.SUBJECT_OF_INTEREST)
    risk_score: int = Field(default=50, alias="riskScore")
    degree: int = Field(default=0)
    degree_centrality: float = Field(default=0.0, alias="degreeCentrality")
    betweenness_centrality: float = Field(default=0.0, alias="betweennessCentrality")
    clustering_coefficient: float = Field(default=0.0, alias="clusteringCoefficient")
    cluster: str = Field(default="General", example="Command")
    status: str = Field(default="Requires Human Review")
    is_hvt: bool = Field(default=False, alias="isHVT")
    is_core: bool = Field(default=True, alias="isCore")
    city: Optional[str] = None
    phone_masked: Optional[str] = Field(None, alias="phoneMasked")
    vehicle_number: Optional[str] = Field(None, alias="vehicleNumber")
    x: Optional[float] = None
    y: Optional[float] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class GraphEdge(BaseModel):
    id: str = Field(..., example="e-1")
    source: str = Field(..., example="ent-1")
    target: str = Field(..., example="ent-2")
    relationship: EdgeRelationship = Field(default=EdgeRelationship.FINANCIAL_TRANSFER)
    label: str = Field(..., example="Informal Layered Transfer ₹12.5L")
    amount_inr: Optional[str] = Field(None, alias="amountINR", example="₹12,50,000")
    frequency: Optional[int] = None
    is_suspicious: bool = Field(default=False, alias="isSuspicious")
    weight: float = Field(default=1.0)

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class GraphMetrics(BaseModel):
    node_count: int = Field(..., alias="nodeCount")
    edge_count: int = Field(..., alias="edgeCount")
    density: float = Field(...)
    average_degree: float = Field(..., alias="averageDegree")
    analysis_engine: str = Field(default="NetworkX 3.x")

    model_config = ConfigDict(populate_by_name=True)


class NetworkGraphData(BaseModel):
    case_id: str = Field(..., alias="caseId")
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    metrics: GraphMetrics
    dataset_label: str = Field(default="Synthetic Investigation Dataset")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
