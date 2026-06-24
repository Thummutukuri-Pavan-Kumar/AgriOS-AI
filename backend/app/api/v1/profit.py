from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import os
import math

from app.core.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.api.v1.farm import get_current_user
from app.schemas.profit import (
    ProfitForecastRequest,
    ProfitForecastResponse,
    CostBreakdown,
    RevenueBreakdown,
    ScenarioAnalysis
)

router = APIRouter(prefix="/profit", tags=["Profit Forecasting"])

# Default market prices (₹ per ton) - will use AI for better estimates
DEFAULT_MARKET_PRICES = {
    "Rice": 22000,
    "Wheat": 24000,
    "Maize": 20000,
    "Cotton": 5500,  # per quintal, converted to ton
    "Sugarcane": 3500,
    "Tomato": 12000,
    "Potato": 10000,
    "Onion": 15000,
    "Chili": 60000,
    "Soybean": 45000,
    "Groundnut": 50000,
    "Sunflower": 45000
}

# Average costs per acre (₹)
DEFAULT_COSTS = {
    "Rice": {"seed": 2500, "fertilizer": 3000, "pesticide": 1500, "labor": 4000, "irrigation": 2000, "harvesting": 3000, "transport": 1500, "miscellaneous": 1000},
    "Wheat": {"seed": 2000, "fertilizer": 3500, "pesticide": 1200, "labor": 3500, "irrigation": 1800, "harvesting": 2500, "transport": 1200, "miscellaneous": 1000},
    "Maize": {"seed": 1800, "fertilizer": 3000, "pesticide": 1000, "labor": 3000, "irrigation": 1500, "harvesting": 2000, "transport": 1000, "miscellaneous": 800},
    "Cotton": {"seed": 2000, "fertilizer": 4000, "pesticide": 2500, "labor": 5000, "irrigation": 2500, "harvesting": 4000, "transport": 2000, "miscellaneous": 1500},
    "Sugarcane": {"seed": 3000, "fertilizer": 5000, "pesticide": 2000, "labor": 6000, "irrigation": 3000, "harvesting": 5000, "transport": 2000, "miscellaneous": 2000},
    "Tomato": {"seed": 3000, "fertilizer": 4000, "pesticide": 3000, "labor": 5000, "irrigation": 2500, "harvesting": 3500, "transport": 2500, "miscellaneous": 1500},
    "Potato": {"seed": 4000, "fertilizer": 3500, "pesticide": 2000, "labor": 4500, "irrigation": 2000, "harvesting": 3000, "transport": 1500, "miscellaneous": 1000},
    "Onion": {"seed": 3000, "fertilizer": 3500, "pesticide": 2000, "labor": 4000, "irrigation": 2000, "harvesting": 3000, "transport": 1500, "miscellaneous": 1000},
    "Chili": {"seed": 3500, "fertilizer": 4500, "pesticide": 3500, "labor": 5500, "irrigation": 2500, "harvesting": 4000, "transport": 2000, "miscellaneous": 1500},
    "Soybean": {"seed": 2500, "fertilizer": 3000, "pesticide": 1500, "labor": 3500, "irrigation": 1800, "harvesting": 2500, "transport": 1200, "miscellaneous": 800},
}

@router.post("/forecast", response_model=ProfitForecastResponse)
async def forecast_profit(
    request: ProfitForecastRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate profit forecast for a crop"""
    try:
        # Get default values if not provided
        market_price = request.market_price if request.market_price > 0 else DEFAULT_MARKET_PRICES.get(request.crop_type, 20000)
        
        # Get default costs
        default_costs = DEFAULT_COSTS.get(request.crop_type, {})
        seed_cost = request.seed_cost if request.seed_cost > 0 else default_costs.get("seed", 2500)
        fertilizer_cost = request.fertilizer_cost if request.fertilizer_cost > 0 else default_costs.get("fertilizer", 3000)
        pesticide_cost = request.pesticide_cost if request.pesticide_cost > 0 else default_costs.get("pesticide", 1500)
        labor_cost = request.labor_cost if request.labor_cost > 0 else default_costs.get("labor", 4000)
        irrigation_cost = request.irrigation_cost if request.irrigation_cost > 0 else default_costs.get("irrigation", 2000)
        harvesting_cost = request.harvesting_cost if request.harvesting_cost > 0 else default_costs.get("harvesting", 3000)
        transport_cost = request.transport_cost if request.transport_cost > 0 else default_costs.get("transport", 1500)
        miscellaneous_cost = request.miscellaneous_cost if request.miscellaneous_cost > 0 else default_costs.get("miscellaneous", 1000)
        
        # Calculate total cost per acre
        total_cost_per_acre = (
            seed_cost + fertilizer_cost + pesticide_cost + labor_cost +
            irrigation_cost + harvesting_cost + transport_cost + miscellaneous_cost
        )
        
        # Total cost for all acres
        total_cost = total_cost_per_acre * request.area_acres
        
        # Calculate total yield
        total_yield = request.expected_yield * request.area_acres
        
        # Calculate total revenue
        total_revenue = total_yield * market_price
        
        # Calculate profit
        total_profit = total_revenue - total_cost
        profit_per_acre = total_profit / request.area_acres if request.area_acres > 0 else 0
        
        # Calculate ROI
        roi_percentage = (total_profit / total_cost) * 100 if total_cost > 0 else 0
        
        # Calculate profit margin
        profit_margin = (total_profit / total_revenue) * 100 if total_revenue > 0 else 0
        
        # Calculate break-even yield (minimum yield needed to break even)
        break_even_yield = total_cost_per_acre / market_price if market_price > 0 else 0
        
        # Cost breakdown
        cost_breakdown = CostBreakdown(
            seed_cost=seed_cost * request.area_acres,
            fertilizer_cost=fertilizer_cost * request.area_acres,
            pesticide_cost=pesticide_cost * request.area_acres,
            labor_cost=labor_cost * request.area_acres,
            irrigation_cost=irrigation_cost * request.area_acres,
            harvesting_cost=harvesting_cost * request.area_acres,
            transport_cost=transport_cost * request.area_acres,
            miscellaneous_cost=miscellaneous_cost * request.area_acres,
            total_cost=total_cost
        )
        
        # Revenue breakdown
        revenue_breakdown = RevenueBreakdown(
            expected_yield=total_yield,
            market_price=market_price,
            total_revenue=total_revenue
        )
        
        # Get AI recommendations
        ai_recommendations = await get_ai_profit_recommendations(
            request.crop_type,
            request.area_acres,
            total_profit,
            roi_percentage
        )
        
        # Generate recommendations
        recommendations = [
            f"Consider crop diversification to manage risk",
            f"Monitor market prices regularly for better selling opportunities",
            f"Use high-yield variety seeds to maximize returns",
        ] + ai_recommendations
        
        return ProfitForecastResponse(
            crop_name=request.crop_type,
            area_acres=request.area_acres,
            cost_breakdown=cost_breakdown,
            revenue_breakdown=revenue_breakdown,
            total_profit=round(total_profit, 2),
            profit_per_acre=round(profit_per_acre, 2),
            roi_percentage=round(roi_percentage, 2),
            break_even_yield=round(break_even_yield, 2),
            profit_margin=round(profit_margin, 2),
            recommendations=recommendations,
            generated_at=datetime.now()
        )
        
    except Exception as e:
        print(f"Error forecasting profit: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

async def get_ai_profit_recommendations(crop: str, area: float, profit: float, roi: float) -> List[str]:
    """Get AI-powered profit improvement recommendations"""
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        prompt = f"""For an Indian farmer growing {crop} on {area} acres with estimated profit of ₹{round(profit, 2)} and ROI of {round(roi, 2)}%, provide 3 specific recommendations to improve profitability. Format as a JSON array of strings."""

        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are an expert agricultural economist. Provide practical profit improvement recommendations for Indian farmers."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=256,
            temperature=0.7
        )
        
        import json
        content = response.choices[0].message.content
        content = content.replace("```json", "").replace("```", "").strip()
        data = json.loads(content)
        return data
        
    except Exception as e:
        print(f"AI recommendations error: {str(e)}")
        return []

@router.post("/scenario-analysis", response_model=List[ScenarioAnalysis])
async def scenario_analysis(
    request: ProfitForecastRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze different scenarios (what-if analysis)"""
    try:
        scenarios = []
        
        # Scenario 1: Base case (using current inputs)
        base_req = request.copy()
        base_result = await forecast_profit(base_req, current_user, db)
        scenarios.append(ScenarioAnalysis(
            scenario_name="Base Scenario",
            profit=base_result.total_profit,
            roi=base_result.roi_percentage,
            description="Based on current inputs and market conditions"
        ))
        
        # Scenario 2: High yield (20% more)
        high_yield_req = request.copy()
        high_yield_req.expected_yield = request.expected_yield * 1.2
        high_result = await forecast_profit(high_yield_req, current_user, db)
        scenarios.append(ScenarioAnalysis(
            scenario_name="High Yield (+20%)",
            profit=high_result.total_profit,
            roi=high_result.roi_percentage,
            description="If you achieve 20% higher yield through better practices"
        ))
        
        # Scenario 3: Low yield (20% less)
        low_yield_req = request.copy()
        low_yield_req.expected_yield = request.expected_yield * 0.8
        low_result = await forecast_profit(low_yield_req, current_user, db)
        scenarios.append(ScenarioAnalysis(
            scenario_name="Low Yield (-20%)",
            profit=low_result.total_profit,
            roi=low_result.roi_percentage,
            description="If yield is 20% lower due to adverse conditions"
        ))
        
        # Scenario 4: High price (20% more)
        high_price_req = request.copy()
        high_price_req.market_price = request.market_price * 1.2
        high_price_result = await forecast_profit(high_price_req, current_user, db)
        scenarios.append(ScenarioAnalysis(
            scenario_name="High Price (+20%)",
            profit=high_price_result.total_profit,
            roi=high_price_result.roi_percentage,
            description="If market price increases by 20%"
        ))
        
        # Scenario 5: Low price (20% less)
        low_price_req = request.copy()
        low_price_req.market_price = request.market_price * 0.8
        low_price_result = await forecast_profit(low_price_req, current_user, db)
        scenarios.append(ScenarioAnalysis(
            scenario_name="Low Price (-20%)",
            profit=low_price_result.total_profit,
            roi=low_price_result.roi_percentage,
            description="If market price decreases by 20%"
        ))
        
        return scenarios
        
    except Exception as e:
        print(f"Error in scenario analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")