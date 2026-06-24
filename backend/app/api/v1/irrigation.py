from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import os

from app.core.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.api.v1.farm import get_current_user
from app.schemas.irrigation import (
    IrrigationRequest, 
    IrrigationRecommendation, 
    IrrigationSchedule
)

router = APIRouter(prefix="/irrigation", tags=["Smart Irrigation"])

# Crop water requirements (liters per acre per day)
CROP_WATER_REQUIREMENTS = {
    "Rice": 1200,
    "Wheat": 800,
    "Maize": 700,
    "Cotton": 900,
    "Sugarcane": 1500,
    "Tomato": 500,
    "Potato": 400,
    "Onion": 350,
    "Chili": 450,
    "Soybean": 600,
    "Groundnut": 550,
    "Sunflower": 500
}

# Soil type water retention (percentage)
SOIL_WATER_RETENTION = {
    "Black Soil": 0.65,
    "Red Soil": 0.45,
    "Alluvial Soil": 0.55,
    "Laterite Soil": 0.40,
    "Sandy Soil": 0.30,
    "Clay Soil": 0.70,
    "Loamy Soil": 0.50
}

# Weather adjustment factors
WEATHER_ADJUSTMENT = {
    "Sunny": 1.2,
    "Cloudy": 0.8,
    "Rainy": 0.3,
    "Hot": 1.4,
    "Humid": 0.9,
    "Normal": 1.0
}

def get_crop_water_requirement(crop: str) -> float:
    """Get daily water requirement for a crop"""
    for key, value in CROP_WATER_REQUIREMENTS.items():
        if key.lower() in crop.lower() or crop.lower() in key.lower():
            return value
    return 500  # Default value

def get_soil_retention(soil: str) -> float:
    """Get water retention factor for soil type"""
    for key, value in SOIL_WATER_RETENTION.items():
        if key.lower() in soil.lower() or soil.lower() in key.lower():
            return value
    return 0.5  # Default value

@router.post("/recommend", response_model=IrrigationRecommendation)
async def get_irrigation_recommendation(
    request: IrrigationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered irrigation recommendations"""
    try:
        # Get crop water requirement
        daily_water = get_crop_water_requirement(request.crop_type)
        
        # Get soil retention factor
        soil_retention = get_soil_retention(request.soil_type)
        
        # Weather adjustment
        weather = request.weather_forecast or "Normal"
        weather_factor = WEATHER_ADJUSTMENT.get(weather, 1.0)
        
        # Calculate water need per acre per day
        water_per_acre = daily_water * weather_factor * (1 - soil_retention * 0.3)
        
        # Total water for entire farm
        total_water = water_per_acre * request.area_acres
        
        # Generate weekly schedule
        schedules = []
        weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        
        for i in range(7):
            # Alternate days for most crops, daily for water-intensive
            if request.crop_type.lower() in ["rice", "sugarcane"]:
                should_irrigate = True
            else:
                should_irrigate = i % 2 == 0  # Every other day
            
            if should_irrigate:
                # Calculate duration based on water need
                # Assuming drip irrigation delivers ~1000 liters/hour per acre
                hours = (water_per_acre / 1000) * 0.5  # 30 minutes per 1000 liters
                minutes = max(15, int(hours * 60))
                
                schedules.append(IrrigationSchedule(
                    day=i + 1,
                    time="6:00 AM",
                    duration_minutes=minutes,
                    water_amount_liters=round(water_per_acre, 2),
                    method="Drip Irrigation" if minutes < 60 else "Sprinkler"
                ))
            else:
                # Rest day
                schedules.append(IrrigationSchedule(
                    day=i + 1,
                    time="Rest Day",
                    duration_minutes=0,
                    water_amount_liters=0,
                    method="No irrigation"
                ))
        
        # Calculate total weekly water
        total_weekly = sum(s.water_amount_liters for s in schedules)
        
        # Generate tips based on conditions
        tips = []
        if soil_retention > 0.6:
            tips.append("Your soil retains water well — avoid overwatering to prevent root rot")
        elif soil_retention < 0.4:
            tips.append("Your soil drains quickly — consider mulching to retain moisture")
        
        if weather_factor > 1.0:
            tips.append("Hot weather expected — consider irrigating in early morning or evening")
        elif weather_factor < 0.5:
            tips.append("Rain forecast — skip irrigation to save water")
        
        tips.append(f"Use drip irrigation to save up to 40% water compared to flood irrigation")
        tips.append("Monitor soil moisture regularly to adjust schedule")
        tips.append("Apply water in the early morning to reduce evaporation")
        
        # Calculate savings estimate
        standard_water = 1000 * request.area_acres * 7  # Standard weekly water
        saved_water = standard_water - total_weekly
        savings_percent = (saved_water / standard_water) * 100 if standard_water > 0 else 0
        
        # Get AI-powered additional insights
        ai_insights = await get_ai_irrigation_insights(
            request.crop_type,
            request.soil_type,
            request.area_acres,
            weather
        )
        
        return IrrigationRecommendation(
            crop_name=request.crop_type,
            soil_type=request.soil_type,
            area_acres=request.area_acres,
            water_requirement=f"{round(water_per_acre, 1)} liters/acre/day",
            weekly_schedule=schedules,
            total_weekly_water=round(total_weekly, 2),
            savings_estimate=f"Save {round(savings_percent, 1)}% water",
            tips=tips + ai_insights.get("tips", []),
            generated_at=datetime.now()
        )
        
    except Exception as e:
        print(f"Error generating irrigation recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

async def get_ai_irrigation_insights(crop: str, soil: str, area: float, weather: str) -> dict:
    """Get AI-powered irrigation insights"""
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        prompt = f"""As an expert agricultural advisor for India, provide irrigation insights for:
        
Crop: {crop}
Soil Type: {soil}
Area: {area} acres
Weather: {weather}

Provide 3 practical irrigation tips for this specific situation. Format as a JSON array of strings with the key "tips"."""

        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are an expert agricultural advisor. Provide practical, actionable irrigation advice for Indian farmers."},
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
        print(f"AI insights error: {str(e)}")
        return {"tips": []}