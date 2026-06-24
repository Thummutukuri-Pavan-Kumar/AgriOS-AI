# from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
# from sqlalchemy.orm import relationship
# from sqlalchemy.sql import func
# from app.core.database import Base
# import enum

# class UserRole(str, enum.Enum):
#     farmer = "farmer"
#     consultant = "consultant"
#     admin = "admin"

# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     full_name = Column(String, nullable=False)
#     email = Column(String, unique=True, index=True, nullable=False)
#     phone = Column(String, unique=True, nullable=True)
#     hashed_password = Column(String, nullable=False)
#     role = Column(Enum(UserRole), default=UserRole.farmer)
#     is_active = Column(Boolean, default=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())

#     farms = relationship("Farm", back_populates="owner")

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    farmer = "farmer"
    consultant = "consultant"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.farmer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    farms = relationship("Farm", back_populates="owner")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")