from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class IrrigationRequest(BaseModel):
    farm_id: int
    crop_type: str
    soil_type: str
    area_acres: float
    weather_forecast: Optional[str] = None  # Sunny, Rainy, Cloudy, etc.

class IrrigationSchedule(BaseModel):
    day: int  
    time: str  
    duration_minutes: int
    water_amount_liters: float
    method: str  

class IrrigationRecommendation(BaseModel):
    crop_name: str
    soil_type: str
    area_acres: float
    water_requirement: str  
    weekly_schedule: List[IrrigationSchedule]
    total_weekly_water: float  
    savings_estimate: str  
    tips: List[str]
    generated_at: datetime

class IrrigationHistory(BaseModel):
    id: int
    farm_id: int
    date: datetime
    water_used_liters: float
    crop_type: str
    weather: str
    notes: Optional[str]