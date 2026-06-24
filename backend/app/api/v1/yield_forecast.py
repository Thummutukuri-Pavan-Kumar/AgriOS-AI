from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import os
import random

from app.core.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.api.v1.farm import get_current_user
from app.schemas.yield_forecast import (
    YieldForecastRequest,
    YieldForecastResponse,
    YieldFactor
)

router = APIRouter(prefix="/yield", tags=["Yield Forecasting"])

# Base yields by crop (tons per acre)
BASE_YIELDS = {
    "Rice": 2.5,
    "Wheat": 3.0,
    "Maize": 4.0,
    "Cotton": 0.8,  # in bales per acre
    "Sugarcane": 35.0,
    "Tomato": 8.0,
    "Potato": 10.0,
    "Onion": 8.0,
    "Chili": 1.2,
    "Soybean": 1.5,
    "Groundnut": 1.8,
    "Sunflower": 1.2
}

# Regional averages (tons per acre)
REGIONAL_AVERAGES = {
    "Rice": {"Andhra Pradesh": 2.8, "Karnataka": 2.5, "Tamil Nadu": 3.0, "Telangana": 2.6, "Punjab": 3.5},
    "Wheat": {"Punjab": 4.5, "Haryana": 4.0, "Uttar Pradesh": 3.2, "Madhya Pradesh": 2.8},
    "Cotton": {"Gujarat": 0.9, "Maharashtra": 0.7, "Telangana": 0.8, "Andhra Pradesh": 0.7},
    "Sugarcane": {"Uttar Pradesh": 35.0, "Maharashtra": 38.0, "Karnataka": 40.0, "Tamil Nadu": 35.0},
    "Tomato": {"Karnataka": 8.5, "Andhra Pradesh": 7.5, "Maharashtra": 8.0, "Odisha": 7.0},
}

# Soil quality factors
SOIL_FACTORS = {
    "Alluvial Soil": 1.2,
    "Black Soil": 1.3,
    "Red Soil": 0.9,
    "Laterite Soil": 0.8,
    "Sandy Soil": 0.7,
    "Clay Soil": 1.1,
    "Loamy Soil": 1.4
}

# Irrigation factors
IRRIGATION_FACTORS = {
    "Drip": 1.4,
    "Sprinkler": 1.2,
    "Flood": 1.0,
    "Rainfed": 0.7
}

# Season factors
SEASON_FACTORS = {
    "Kharif": 1.1,
    "Rabi": 1.0,
    "Zaid": 0.9
}

# Weather impact (simplified)
def get_weather_impact(state: str, season: str) -> float:
    """Simulate weather impact based on state and season"""
    # In production, this would use real weather data
    weather_factors = {
        "Andhra Pradesh": {"Kharif": 0.9, "Rabi": 1.1, "Zaid": 0.8},
        "Karnataka": {"Kharif": 1.0, "Rabi": 1.0, "Zaid": 0.9},
        "Maharashtra": {"Kharif": 0.8, "Rabi": 1.1, "Zaid": 0.8},
        "Punjab": {"Kharif": 1.0, "Rabi": 1.2, "Zaid": 0.9},
        "Tamil Nadu": {"Kharif": 0.9, "Rabi": 1.0, "Zaid": 0.9},
        "Uttar Pradesh": {"Kharif": 1.0, "Rabi": 1.1, "Zaid": 0.9},
        "Gujarat": {"Kharif": 0.8, "Rabi": 1.0, "Zaid": 0.7},
        "Telangana": {"Kharif": 0.9, "Rabi": 1.0, "Zaid": 0.8},
    }
    return weather_factors.get(state, {}).get(season, 1.0)

def get_regional_average(crop: str, state: str) -> float:
    """Get regional average yield for a crop"""
    crop_averages = REGIONAL_AVERAGES.get(crop, {})
    return crop_averages.get(state, BASE_YIELDS.get(crop, 2.0))

@router.post("/forecast", response_model=YieldForecastResponse)
async def forecast_yield(
    request: YieldForecastRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate yield forecast for a crop"""
    try:
        # Get base yield
        base_yield = BASE_YIELDS.get(request.crop_type, 2.0)
        
        # Get soil factor
        soil_factor = SOIL_FACTORS.get(request.soil_type, 1.0)
        
        # Get irrigation factor
        irrigation_factor = IRRIGATION_FACTORS.get(request.irrigation_type, 1.0)
        
        # Get season factor
        season_factor = SEASON_FACTORS.get(request.season, 1.0)
        
        # Get weather impact
        weather_impact = get_weather_impact(request.state, request.season)
        
        # Get regional average
        regional_avg = get_regional_average(request.crop_type, request.state)
        
        # Calculate predicted yield
        # Base yield * all factors + some randomness
        predicted_yield = base_yield * soil_factor * irrigation_factor * season_factor * weather_impact
        
        # Add slight randomness for realism (but keep within bounds)
        random_factor = 0.95 + (random.random() * 0.1)  # 0.95 to 1.05
        predicted_yield *= random_factor
        
        # Round to 2 decimal places
        predicted_yield = round(predicted_yield, 2)
        
        # Calculate min and max (allow ±20% variation)
        min_yield = round(predicted_yield * 0.8, 2)
        max_yield = round(predicted_yield * 1.2, 2)
        
        # Calculate confidence score (higher if factors are favorable)
        confidence = 70
        if soil_factor >= 1.2:
            confidence += 10
        if irrigation_factor >= 1.2:
            confidence += 10
        if weather_impact >= 1.0:
            confidence += 10
        confidence = min(95, confidence)
        
        # Determine comparison with regional average
        if predicted_yield > regional_avg * 1.1:
            comparison = "Above average"
        elif predicted_yield < regional_avg * 0.9:
            comparison = "Below average"
        else:
            comparison = "At average"
        
        # Generate factors
        factors = []
        
        # Soil factor
        if soil_factor >= 1.2:
            factors.append(YieldFactor(
                name="Soil Quality",
                impact="Positive",
                description=f"{request.soil_type} is highly suitable for {request.crop_type}"
            ))
        elif soil_factor >= 0.9:
            factors.append(YieldFactor(
                name="Soil Quality",
                impact="Neutral",
                description=f"{request.soil_type} is moderately suitable for {request.crop_type}"
            ))
        else:
            factors.append(YieldFactor(
                name="Soil Quality",
                impact="Negative",
                description=f"{request.soil_type} may limit yield potential"
            ))
        
        # Irrigation factor
        if irrigation_factor >= 1.2:
            factors.append(YieldFactor(
                name="Irrigation Method",
                impact="Positive",
                description=f"{request.irrigation_type} irrigation optimizes water usage"
            ))
        elif irrigation_factor >= 0.9:
            factors.append(YieldFactor(
                name="Irrigation Method",
                impact="Neutral",
                description=f"{request.irrigation_type} irrigation is adequate"
            ))
        else:
            factors.append(YieldFactor(
                name="Irrigation Method",
                impact="Negative",
                description=f"Rainfed conditions may reduce yield potential"
            ))
        
        # Weather factor
        if weather_impact >= 1.0:
            factors.append(YieldFactor(
                name="Weather Conditions",
                impact="Positive",
                description=f"Favorable weather expected for {request.season} season"
            ))
        else:
            factors.append(YieldFactor(
                name="Weather Conditions",
                impact="Negative",
                description=f"Challenging weather may affect {request.season} crop"
            ))
        
        # Get AI-powered recommendations
        ai_recommendations = await get_ai_yield_recommendations(
            request.crop_type,
            request.soil_type,
            request.irrigation_type,
            request.season,
            predicted_yield
        )
        
        # Generate recommendations
        recommendations = [
            f"Use recommended fertilizer (NPK ratio) for {request.crop_type}",
            f"Maintain optimal plant spacing for {request.crop_type}",
            "Monitor pest and disease levels regularly",
        ] + ai_recommendations
        
        return YieldForecastResponse(
            crop_name=request.crop_type,
            predicted_yield=predicted_yield,
            yield_unit="tons/acre",
            confidence_score=confidence,
            min_yield=min_yield,
            max_yield=max_yield,
            factors=factors,
            recommendations=recommendations,
            regional_average=regional_avg,
            comparison=comparison,
            generated_at=datetime.now()
        )
        
    except Exception as e:
        print(f"Error forecasting yield: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

async def get_ai_yield_recommendations(crop: str, soil: str, irrigation: str, season: str, predicted_yield: float) -> List[str]:
    """Get AI-powered yield improvement recommendations"""
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        prompt = f"""For an Indian farmer growing {crop} in {soil} with {irrigation} irrigation during {season} season (predicted yield: {predicted_yield} tons/acre), provide 3 specific recommendations to improve yield. Format as a JSON array of strings."""

        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are an expert agricultural advisor. Provide practical yield improvement recommendations for Indian farmers."},
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