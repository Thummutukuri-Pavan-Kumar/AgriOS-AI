from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class YieldForecastRequest(BaseModel):
    crop_type: str
    soil_type: str
    area_acres: float
    irrigation_type: str  # Drip, Sprinkler, Flood, Rainfed
    season: str  # Kharif, Rabi, Zaid
    state: str
    district: str
    
class YieldFactor(BaseModel):
    name: str
    impact: str  # Positive, Negative, Neutral
    description: str
    
class YieldForecastResponse(BaseModel):
    crop_name: str
    predicted_yield: float  # in tons per acre
    yield_unit: str  # tons/acre or quintals/acre
    confidence_score: int  # 0-100
    min_yield: float  # Minimum expected
    max_yield: float  # Maximum expected
    factors: List[YieldFactor]
    recommendations: List[str]
    regional_average: float  # Average yield in the region
    comparison: str  # Above average, Below average, At average
    generated_at: datetime