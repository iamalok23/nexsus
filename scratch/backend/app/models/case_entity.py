"""SQLAlchemy junction model for Cases and Entities."""
from sqlalchemy import Column, String
from app.utils.database import Base
from app.models.base import TimestampMixin


class CaseEntityModel(Base, TimestampMixin):
    """Many-to-Many junction between Cases and Entities with tactical role context."""
    __tablename__ = "case_entities"

    id = Column(String(50), primary_key=True, index=True)
    case_id = Column(String(50), index=True, nullable=False)
    entity_id = Column(String(50), index=True, nullable=False)
    role_in_case = Column(String(100), default="Subject of Interest")
    association_date = Column(String(50), nullable=True)
