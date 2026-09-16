"""SQLAlchemy model for Investigation Timeline Events."""
from sqlalchemy import Column, String, Integer, Float, Text, JSON
from app.utils.database import Base
from app.models.base import TimestampMixin


class TimelineEventModel(Base, TimestampMixin):
    """Chronological intelligence event across wiretaps, financial movements, ANPR sightings & warrants."""
    __tablename__ = "timeline_events"

    id = Column(String(50), primary_key=True, index=True)
    case_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(String(50), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), index=True, nullable=False)  # wiretap, financial, sighting, warrant, arrest, intel
    location = Column(String(200), nullable=False)
    city = Column(String(100), nullable=True)
    
    entity_ids = Column(JSON, default=list)
    entity_names = Column(JSON, default=list)
    
    evidence_id = Column(String(50), nullable=True, index=True)
    confidence_score = Column(Integer, default=85)
    source_citation = Column(String(200), nullable=True)
