from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SchemeRequest(BaseModel):
    state: str
    district: str
    crop_type: Optional[str] = None
    farm_size: float  # in acres
    category: str  # General, SC, ST, OBC
    farmer_type: str  # Small, Medium, Large

class SchemeResponse(BaseModel):
    scheme_name: str
    scheme_type: str  # Central, State, Both
    description: str
    eligibility_criteria: List[str]
    benefits: str
    financial_benefit: float  # in ₹
    application_process: List[str]
    deadline: str
    website: str
    helpline: str
    is_eligible: bool
    match_score: int  # 0-100

class SchemeComparison(BaseModel):
    scheme_name: str
    financial_benefit: float
    eligibility_score: int
    application_complexity: str  # Easy, Medium, Complex
    processing_time: str

class SchemeEligibilityRequest(BaseModel):
    scheme_name: str
    state: str
    district: str
    farm_size: float
    crop_type: str
    category: str