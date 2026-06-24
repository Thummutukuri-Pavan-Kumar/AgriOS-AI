# from pydantic import BaseModel
# from typing import Optional, List
# from datetime import datetime

# class FarmCreate(BaseModel):
#     farm_name: str
#     location_state: str
#     location_district: str
#     total_area_acres: float
#     soil_type: Optional[str] = None
#     primary_crops: Optional[List[str]] = None
#     water_source: Optional[str] = None

# class FarmUpdate(BaseModel):
#     farm_name: Optional[str] = None
#     location_state: Optional[str] = None
#     location_district: Optional[str] = None
#     total_area_acres: Optional[float] = None
#     soil_type: Optional[str] = None
#     primary_crops: Optional[List[str]] = None
#     water_source: Optional[str] = None

# class FarmResponse(BaseModel):
#     id: int
#     owner_id: int
#     farm_name: str
#     location_state: str
#     location_district: str
#     total_area_acres: float
#     soil_type: Optional[str]
#     primary_crops: Optional[List[str]]
#     water_source: Optional[str]
#     health_score: float
#     created_at: datetime
#     updated_at: datetime

#     class Config:
#         from_attributes = True

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FarmCreate(BaseModel):
    farm_name: str
    location_state: str
    location_district: str
    total_area_acres: float
    soil_type: Optional[str] = None
    primary_crops: Optional[List[str]] = None
    water_source: Optional[str] = None

class FarmUpdate(BaseModel):
    farm_name: Optional[str] = None
    location_state: Optional[str] = None
    location_district: Optional[str] = None
    total_area_acres: Optional[float] = None
    soil_type: Optional[str] = None
    primary_crops: Optional[List[str]] = None
    water_source: Optional[str] = None

class FarmResponse(BaseModel):
    id: int
    owner_id: int
    farm_name: str
    location_state: str
    location_district: str
    total_area_acres: float
    soil_type: Optional[str] = None
    primary_crops: Optional[List[str]] = None
    water_source: Optional[str] = None
    health_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True