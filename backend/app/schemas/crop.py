from pydantic import BaseModel
from typing import Optional, List

class CropRecommendationRequest(BaseModel):
    soil_type: str
    state: str
    district: str
    season: str  # Kharif, Rabi, Zaid
    area_acres: float

class CropRecommendationResponse(BaseModel):
    crop_name: str
    expected_yield: str  # e.g., "2.5 tons/acre"
    profit_estimate: str  # e.g., "₹50,000/acre"
    confidence_score: int  # 0-100
    reason: str