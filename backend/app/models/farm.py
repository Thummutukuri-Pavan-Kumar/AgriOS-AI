from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_name = Column(String, nullable=False)
    location_state = Column(String, nullable=False)
    location_district = Column(String, nullable=False)
    total_area_acres = Column(Float, nullable=False)
    soil_type = Column(String, nullable=True)
    primary_crops = Column(JSON, nullable=True)
    water_source = Column(String, nullable=True)
    health_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="farms")