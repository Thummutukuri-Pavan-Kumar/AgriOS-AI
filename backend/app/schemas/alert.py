from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AlertCreate(BaseModel):
    alert_type: str  # Disease, Weather, Irrigation, Market, Scheme, System
    title: str
    message: str
    priority: str  # High, Medium, Low
    action_url: Optional[str] = None
    crop_type: Optional[str] = None

class AlertResponse(BaseModel):
    id: int
    user_id: int
    alert_type: str
    title: str
    message: str
    priority: str
    is_read: bool
    action_url: Optional[str]
    crop_type: Optional[str]
    created_at: datetime
    read_at: Optional[datetime]

class AlertUpdate(BaseModel):
    is_read: bool

class AlertCountResponse(BaseModel):
    total: int
    unread: int
    high_priority: int