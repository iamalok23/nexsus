"""SQLAlchemy model for Evidence Records."""
from sqlalchemy import Column, String, Integer, Text, JSON
from app.utils.database import Base
from app.models.base import TimestampMixin


class EvidenceModel(Base, TimestampMixin):
    __tablename__ = "evidence"

    id = Column(String(50), primary_key=True, index=True)
    evidence_number = Column(String(50), unique=True, index=True, nullable=False)
    case_id = Column(String(50), index=True, nullable=False)
    case_name = Column(String(150), default="Operation Chakravyuh")
    title = Column(String(200), nullable=False)
    type = Column(String(50), default="document")  # txt, csv, json, cdr, surveillance
    classification = Column(String(50), default="LAW ENFORCEMENT SENSITIVE")
    date_collected = Column(String(50), nullable=False)
    collected_by = Column(String(150), default="Special Unit")
    badge_number = Column(String(50), default="DL-SPL-4412")
    location = Column(String(150), default="Delhi NCR")
    city = Column(String(100), default="Delhi")
    hash_sha256 = Column(String(64), nullable=False)
    ai_summary = Column(Text, default="")
    ai_extraction_tags = Column(JSON, default=list)
    linked_entity_ids = Column(JSON, default=list)
    amount_inr = Column(String(50), nullable=True)
    phone_ref = Column(String(50), nullable=True)
    vehicle_ref = Column(String(50), nullable=True)
    file_details = Column(JSON, default=dict)
