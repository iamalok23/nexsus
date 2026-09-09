"""SQLAlchemy model for Entities."""
from sqlalchemy import Column, String, Integer, Text, JSON
from app.utils.database import Base
from app.models.base import TimestampMixin


class EntityModel(Base, TimestampMixin):
    __tablename__ = "entities"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    type = Column(String(50), default="subject_of_interest", nullable=False)
    risk_score = Column(Integer, default=50)
    risk_level = Column(String(20), default="ELEVATED")
    status = Column(String(50), default="Requires Human Review")
    aliases = Column(JSON, default=list)
    primary_affiliation = Column(String(200), default="")
    role = Column(String(150), default="")
    phone_masked = Column(String(50), nullable=True)
    vehicle_number = Column(String(50), nullable=True)
    city = Column(String(100), default="Delhi")
    nationality = Column(String(50), default="Indian")
    photo = Column(String(300), nullable=True)
    last_known_location = Column(JSON, default=dict)
    tags = Column(JSON, default=list)
    details = Column(JSON, default=dict)
