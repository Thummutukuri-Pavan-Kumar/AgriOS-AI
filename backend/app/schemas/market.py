from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MarketPriceRequest(BaseModel):
    crop_type: str
    state: str
    district: Optional[str] = None

class MarketPriceResponse(BaseModel):
    crop_name: str
    state: str
    market: str
    current_price: float  # ₹ per ton or quintal
    price_unit: str  # per ton or per quintal
    price_trend: str  # Up, Down, Stable
    price_change_percent: float  # Percentage change from yesterday
    demand_level: str  # High, Medium, Low
    best_selling_time: str  # e.g., "Next 2 weeks"
    historical_prices: List[float]  # Last 7 days prices
    generated_at: datetime

class MarketAlert(BaseModel):
    crop_name: str
    current_price: float
    previous_price: float
    change_percent: float
    alert_type: str  # Price Surge, Price Drop, High Demand
    message: str
    created_at: datetime