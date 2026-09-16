"""SQLAlchemy model for Investigator Activity & Audit Logs."""
from sqlalchemy import Column, String, Text, JSON
from app.utils.database import Base
from app.models.base import TimestampMixin


class AuditLogModel(Base, TimestampMixin):
    """Secure immutable audit trail recording access, examination, and case changes."""
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True, index=True)
    officer_email = Column(String(150), nullable=False, index=True)
    officer_badge = Column(String(100), nullable=True)
    action = Column(String(100), nullable=False, index=True)  # VIEW_DOSSIER, CREATE_CASE, UPDATE_CASE, INGEST_DATA, EXPORT_REPORT
    resource_type = Column(String(50), nullable=False)        # case, entity, evidence, network, timeline
    resource_id = Column(String(100), nullable=True)
    timestamp = Column(String(50), nullable=False, index=True)
    ip_address = Column(String(50), nullable=True)
    details = Column(JSON, default=dict)
