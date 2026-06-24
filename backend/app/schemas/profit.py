from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProfitForecastRequest(BaseModel):
    crop_type: str
    area_acres: float
    expected_yield: float  # tons per acre from yield forecast
    market_price: float  # per ton in ₹
    seed_cost: float  # per acre
    fertilizer_cost: float  # per acre
    pesticide_cost: float  # per acre
    labor_cost: float  # per acre
    irrigation_cost: float  # per acre
    harvesting_cost: float  # per acre
    transport_cost: float  # per acre
    miscellaneous_cost: float  # per acre

class CostBreakdown(BaseModel):
    seed_cost: float
    fertilizer_cost: float
    pesticide_cost: float
    labor_cost: float
    irrigation_cost: float
    harvesting_cost: float
    transport_cost: float
    miscellaneous_cost: float
    total_cost: float

class RevenueBreakdown(BaseModel):
    expected_yield: float  # total tons
    market_price: float  # per ton
    total_revenue: float

class ProfitForecastResponse(BaseModel):
    crop_name: str
    area_acres: float
    cost_breakdown: CostBreakdown
    revenue_breakdown: RevenueBreakdown
    total_profit: float
    profit_per_acre: float
    roi_percentage: float
    break_even_yield: float  # minimum tons needed
    profit_margin: float  # percentage
    recommendations: List[str]
    generated_at: datetime

class ScenarioAnalysis(BaseModel):
    scenario_name: str
    profit: float
    roi: float
    description: str