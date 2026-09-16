"""SQLAlchemy model for Derived Relationships (Investigative Leads)."""
from sqlalchemy import Column, String, Integer, Float, Text, JSON
from app.utils.database import Base
from app.models.base import TimestampMixin


class RelationshipModel(Base, TimestampMixin):
    """Represents an investigative lead connecting two entities.
    
    NOTE: All relationships are analytical leads, not proof of guilt.
    """
    __tablename__ = "relationships"

    id = Column(String(50), primary_key=True, index=True)
    case_id = Column(String(50), index=True, nullable=False)
    source_id = Column(String(50), index=True, nullable=False)
    target_id = Column(String(50), index=True, nullable=False)
    relationship_type = Column(String(50), index=True, nullable=False)  # frequent_caller, financial_loop, shared_vehicle, co_traveler, syndicate_link
    label = Column(String(150), nullable=False)
    
    strength_score = Column(Float, default=0.5)  # 0.0 to 1.0
    frequency = Column(Integer, default=1)
    first_seen = Column(String(50), nullable=True)
    last_seen = Column(String(50), nullable=True)
    
    amount_inr = Column(String(50), nullable=True)
    is_suspicious = Column(String(10), default="true")
    
    source_evidence_id = Column(String(50), nullable=True, index=True)
    supporting_interaction_ids = Column(JSON, default=list)
    investigator_notes = Column(Text, nullable=True)
