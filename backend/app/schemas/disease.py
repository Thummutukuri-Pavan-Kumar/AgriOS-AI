from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DiseaseDetectionRequest(BaseModel):
    pass

class DiseaseDetectionResponse(BaseModel):
    disease_name: str
    confidence: float  # 0-100
    severity: str  # Mild, Moderate, Severe
    symptoms: List[str]
    treatment: str
    prevention: str
    organic_remedy: str
    chemical_remedy: str
    detected_at: datetime

class DetectionHistoryResponse(BaseModel):
    id: int
    image_url: str
    disease_name: str
    confidence: float
    created_at: datetime
    user_id: int