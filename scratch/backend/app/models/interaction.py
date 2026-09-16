"""SQLAlchemy model for Calls and Interactions."""
from sqlalchemy import Column, String, Integer, Float, Text, JSON, DateTime
from datetime import datetime, timezone
from app.utils.database import Base
from app.models.base import TimestampMixin


class InteractionModel(Base, TimestampMixin):
    """Represents a discrete communication, financial transaction, or physical sighting."""
    __tablename__ = "interactions"

    id = Column(String(50), primary_key=True, index=True)
    case_id = Column(String(50), index=True, nullable=False)
    interaction_type = Column(String(50), index=True, nullable=False)  # call, financial_transfer, vehicle_sighting, meeting, sms
    source_entity_id = Column(String(50), index=True, nullable=True)
    target_entity_id = Column(String(50), index=True, nullable=True)
    
    # Telephony
    caller_phone = Column(String(50), nullable=True, index=True)
    receiver_phone = Column(String(50), nullable=True, index=True)
    duration_seconds = Column(Integer, default=0)
    
    # Financial
    amount_inr = Column(Float, nullable=True)
    account_source = Column(String(100), nullable=True)
    account_target = Column(String(100), nullable=True)
    
    # Spatio-Temporal
    timestamp = Column(String(50), nullable=False, index=True)
    location_name = Column(String(200), nullable=True)
    city = Column(String(100), nullable=True, index=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    
    # Vehicular
    vehicle_number = Column(String(50), nullable=True, index=True)
    toll_plaza = Column(String(150), nullable=True)
    
    # Provenance
    evidence_id = Column(String(50), index=True, nullable=True)
    source_file = Column(String(255), nullable=True)
    raw_record = Column(JSON, default=dict)
    notes = Column(Text, nullable=True)
