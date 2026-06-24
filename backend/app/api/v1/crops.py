from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.schemas.crop import CropRecommendationRequest, CropRecommendationResponse
from app.api.v1.farm import get_current_user
import os

router = APIRouter(prefix="/crops", tags=["Crop Recommendation"])

@router.post("/recommend", response_model=List[CropRecommendationResponse])
def recommend_crops(
    request: CropRecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get crop recommendations based on soil, location, and season"""
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        prompt = f"""As an expert agricultural advisor for India, recommend the TOP 3 best crops for the following farm:

Soil Type: {request.soil_type}
State: {request.state}
District: {request.district}
Season: {request.season}
Area: {request.area_acres} acres

For each crop, provide:
1. Crop Name
2. Expected yield per acre (in tons or quintals)
3. Profit estimate per acre (in ₹)
4. Confidence score (0-100)
5. Brief reason why it's suitable

Format your response as a valid JSON array with these fields:
- crop_name
- expected_yield
- profit_estimate
- confidence_score
- reason

Only return the JSON array, nothing else."""

        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are an expert agricultural advisor for Indian farmers. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1024,
            temperature=0.7
        )
        
        import json
        content = response.choices[0].message.content
        # Clean the response if it has markdown
        content = content.replace("```json", "").replace("```", "").strip()
        recommendations = json.loads(content)
        
        return recommendations[:3]  # Return top 3
        
    except Exception as e:
        print(f"Error recommending crops: {str(e)}")
        # Return fallback recommendations
        return [
            {
                "crop_name": "Rice (Paddy)",
                "expected_yield": "2.5 tons/acre",
                "profit_estimate": "₹45,000/acre",
                "confidence_score": 85,
                "reason": "Suitable for alluvial soil and good water availability"
            },
            {
                "crop_name": "Cotton",
                "expected_yield": "3.5 quintals/acre",
                "profit_estimate": "₹55,000/acre",
                "confidence_score": 80,
                "reason": "Ideal for black soil and warm climate"
            },
            {
                "crop_name": "Onion",
                "expected_yield": "8 tons/acre",
                "profit_estimate": "₹60,000/acre",
                "confidence_score": 75,
                "reason": "Profitable cash crop with good demand in the region"
            }
        ]