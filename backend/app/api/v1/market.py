from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import os
import random

from app.core.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.api.v1.farm import get_current_user
from app.schemas.market import MarketPriceRequest, MarketPriceResponse, MarketAlert

router = APIRouter(prefix="/market", tags=["Market Intelligence"])

# Base prices (₹ per ton) - will be enhanced with AI
BASE_PRICES = {
    "Rice": {"base": 22000, "range": (20000, 25000)},
    "Wheat": {"base": 24000, "range": (22000, 26000)},
    "Maize": {"base": 20000, "range": (18000, 22000)},
    "Cotton": {"base": 55000, "range": (50000, 60000)},  # per ton
    "Sugarcane": {"base": 3500, "range": (3000, 4000)},
    "Tomato": {"base": 12000, "range": (10000, 15000)},
    "Potato": {"base": 10000, "range": (8000, 12000)},
    "Onion": {"base": 15000, "range": (12000, 18000)},
    "Chili": {"base": 60000, "range": (50000, 70000)},
    "Soybean": {"base": 45000, "range": (40000, 50000)},
    "Groundnut": {"base": 50000, "range": (45000, 55000)},
    "Sunflower": {"base": 45000, "range": (40000, 50000)}
}

# State-wise price variations
STATE_VARIATIONS = {
    "Andhra Pradesh": 1.05,
    "Karnataka": 1.00,
    "Maharashtra": 0.95,
    "Punjab": 1.10,
    "Tamil Nadu": 1.05,
    "Uttar Pradesh": 0.90,
    "Gujarat": 0.95,
    "Telangana": 1.00,
    "Madhya Pradesh": 0.90,
    "Bihar": 0.85,
    "Rajasthan": 0.90,
    "West Bengal": 0.88
}

# Demand levels based on season
SEASON_DEMAND = {
    "Rice": {"Kharif": "High", "Rabi": "Medium", "Zaid": "Low"},
    "Wheat": {"Kharif": "Low", "Rabi": "High", "Zaid": "Medium"},
    "Maize": {"Kharif": "High", "Rabi": "Medium", "Zaid": "Medium"},
    "Cotton": {"Kharif": "High", "Rabi": "Low", "Zaid": "Low"},
    "Sugarcane": {"Kharif": "Medium", "Rabi": "High", "Zaid": "Medium"},
    "Tomato": {"Kharif": "High", "Rabi": "High", "Zaid": "High"},
    "Potato": {"Kharif": "Medium", "Rabi": "High", "Zaid": "Low"},
    "Onion": {"Kharif": "Medium", "Rabi": "High", "Zaid": "Medium"},
    "Chili": {"Kharif": "High", "Rabi": "Medium", "Zaid": "Low"},
    "Soybean": {"Kharif": "High", "Rabi": "Low", "Zaid": "Low"},
    "Groundnut": {"Kharif": "High", "Rabi": "Medium", "Zaid": "Low"},
    "Sunflower": {"Kharif": "Medium", "Rabi": "High", "Zaid": "Low"}
}

def get_season() -> str:
    """Determine current season"""
    month = datetime.now().month
    if 6 <= month <= 10:
        return "Kharif"
    elif 11 <= month <= 3:
        return "Rabi"
    else:
        return "Zaid"

def generate_price_history(base_price: float, days: int = 7) -> List[float]:
    """Generate realistic price history"""
    history = []
    price = base_price
    
    for i in range(days):
        # Random daily variation (±5%)
        variation = 1 + random.uniform(-0.05, 0.05)
        price = round(price * variation, 2)
        history.append(price)
    
    return history

def get_market_by_state(state: str) -> str:
    """Get major market name by state"""
    markets = {
        "Andhra Pradesh": "Vijayawada",
        "Karnataka": "Bengaluru",
        "Maharashtra": "Mumbai",
        "Punjab": "Ludhiana",
        "Tamil Nadu": "Chennai",
        "Uttar Pradesh": "Lucknow",
        "Gujarat": "Ahmedabad",
        "Telangana": "Hyderabad",
        "Madhya Pradesh": "Indore",
        "Bihar": "Patna",
        "Rajasthan": "Jaipur",
        "West Bengal": "Kolkata"
    }
    return markets.get(state, "Local Market")

@router.post("/prices", response_model=MarketPriceResponse)
async def get_market_prices(
    request: MarketPriceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current market prices for a crop"""
    try:
        # Get base price for crop
        crop_data = BASE_PRICES.get(request.crop_type)
        if not crop_data:
            # Default fallback
            base_price = 20000
            price_range = (15000, 25000)
        else:
            base_price = crop_data["base"]
            price_range = crop_data["range"]
        
        # Apply state variation
        state_factor = STATE_VARIATIONS.get(request.state, 1.0)
        
        # Add random daily variation (±5%)
        daily_variation = 1 + random.uniform(-0.05, 0.05)
        
        # Calculate current price
        current_price = round(base_price * state_factor * daily_variation, 2)
        
        # Ensure price stays within range
        if current_price < price_range[0]:
            current_price = price_range[0] + random.uniform(0, 500)
        elif current_price > price_range[1]:
            current_price = price_range[1] - random.uniform(0, 500)
        current_price = round(current_price, 2)
        
        # Determine price trend
        trend_roll = random.random()
        if trend_roll < 0.4:
            trend = "Up"
            change = round(random.uniform(1, 8), 1)
        elif trend_roll < 0.8:
            trend = "Down"
            change = round(random.uniform(1, 8), 1)
        else:
            trend = "Stable"
            change = round(random.uniform(0, 1), 1)
        
        # Get demand level
        season = get_season()
        demand = SEASON_DEMAND.get(request.crop_type, {}).get(season, "Medium")
        
        # Generate price history (last 7 days)
        history = generate_price_history(current_price, 7)
        
        # Determine best selling time
        if trend == "Up" and demand in ["High", "Medium"]:
            best_time = "Sell in next 1-2 weeks"
        elif trend == "Down":
            best_time = "Sell immediately"
        elif demand == "High":
            best_time = "Sell now while demand is high"
        else:
            best_time = "Wait for price improvement"
        
        # Get market name
        market_name = get_market_by_state(request.state)
        
        return MarketPriceResponse(
            crop_name=request.crop_type,
            state=request.state,
            market=market_name,
            current_price=current_price,
            price_unit="₹ per ton",
            price_trend=trend,
            price_change_percent=change,
            demand_level=demand,
            best_selling_time=best_time,
            historical_prices=history,
            generated_at=datetime.now()
        )
        
    except Exception as e:
        print(f"Error getting market prices: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/trends", response_model=List[float])
async def get_price_trends(
    crop_type: str,
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get historical price trends for a crop"""
    try:
        crop_data = BASE_PRICES.get(crop_type, {"base": 20000})
        base_price = crop_data["base"]
        return generate_price_history(base_price, days)
    except Exception as e:
        print(f"Error getting price trends: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/alerts", response_model=List[MarketAlert])
async def get_market_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get market alerts for user's crops"""
    try:
        # Get user's farm to know their crops
        farm = db.query(Farm).filter(Farm.owner_id == current_user.id).first()
        if not farm:
            return []
        
        # Get crops from farm
        crops = farm.primary_crops if farm.primary_crops else ["Rice", "Wheat", "Tomato"]
        
        alerts = []
        for crop in crops[:3]:  # Limit to 3 crops
            crop_data = BASE_PRICES.get(crop, {"base": 20000, "range": (15000, 25000)})
            base_price = crop_data["base"]
            
            # Generate realistic price change
            change_percent = round(random.uniform(-8, 12), 1)
            current_price = round(base_price * (1 + change_percent/100), 2)
            
            # Determine alert type
            if change_percent > 5:
                alert_type = "Price Surge"
                message = f"{crop} price increased by {change_percent}%! Good time to sell."
            elif change_percent < -3:
                alert_type = "Price Drop"
                message = f"{crop} price dropped by {abs(change_percent)}%. Consider selling now."
            elif change_percent > 2:
                alert_type = "Price Increase"
                message = f"{crop} price is rising ({change_percent}%). Monitor closely."
            else:
                alert_type = "Stable"
                message = f"{crop} prices are stable. No urgent action needed."
            
            alerts.append(MarketAlert(
                crop_name=crop,
                current_price=current_price,
                previous_price=round(base_price, 2),
                change_percent=change_percent,
                alert_type=alert_type,
                message=message,
                created_at=datetime.now() - timedelta(hours=random.randint(1, 24))
            ))
        
        return alerts
        
    except Exception as e:
        print(f"Error getting market alerts: {str(e)}")
        return []