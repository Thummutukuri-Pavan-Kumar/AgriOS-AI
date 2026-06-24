from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    alert_type = Column(String, nullable=False)  # Disease, Weather, Irrigation, Market, Scheme, System
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String, default="Medium")  # High, Medium, Low
    is_read = Column(Boolean, default=False)
    action_url = Column(String, nullable=True)
    crop_type = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="alerts")