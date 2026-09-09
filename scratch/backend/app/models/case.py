"""SQLAlchemy model for Cases."""
from sqlalchemy import Column, String, Integer, Text
from app.utils.database import Base
from app.models.base import TimestampMixin


class CaseModel(Base, TimestampMixin):
    __tablename__ = "cases"

    id = Column(String(50), primary_key=True, index=True)
    case_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    code_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="Active Investigation", nullable=False)
    priority = Column(String(20), default="CRITICAL", nullable=False)
    lead_investigator = Column(String(150), nullable=False)
    agency = Column(String(200), nullable=False)
    jurisdiction = Column(String(200), nullable=False)
    opened_date = Column(String(50), nullable=False)
    last_updated = Column(String(50), nullable=False)
    warrants_issued = Column(Integer, default=0)
    assets_seized = Column(String(50), default="₹0")
    entities_count = Column(Integer, default=0)
    evidence_count = Column(Integer, default=0)
    risk_index = Column(Integer, default=50)
