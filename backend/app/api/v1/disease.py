from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import os
import shutil
import uuid
import json
from PIL import Image
import numpy as np
#import cv2
from PIL import Image

from app.core.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.api.v1.farm import get_current_user
from app.schemas.disease import DiseaseDetectionResponse, DetectionHistoryResponse

router = APIRouter(prefix="/disease", tags=["Disease Detection"])

# Create upload directory
UPLOAD_DIR = "uploads/disease"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Simple disease database (will be enhanced with ML)
DISEASE_DB = {
    "tomato_leaf_blight": {
        "name": "Tomato Leaf Blight",
        "symptoms": ["Brown spots on leaves", "Yellowing around spots", "Leaf curling"],
        "severity": "Moderate",
        "treatment": "Apply copper-based fungicide every 7-10 days",
        "prevention": "Crop rotation, proper spacing, avoid overhead watering",
        "organic_remedy": "Neem oil spray (1:100 ratio) every 5-7 days",
        "chemical_remedy": "Copper oxychloride 50% WP @ 2g/L water"
    },
    "tomato_leaf_mold": {
        "name": "Tomato Leaf Mold",
        "symptoms": ["Yellow spots on upper leaf surface", "White/gray mold on underside", "Leaf drop"],
        "severity": "Moderate",
        "treatment": "Improve air circulation, apply sulfur-based fungicide",
        "prevention": "Space plants properly, avoid wet foliage",
        "organic_remedy": "Baking soda spray (1 tsp per liter water)",
        "chemical_remedy": "Mancozeb 75% WP @ 2g/L water"
    },
    "cotton_wilt": {
        "name": "Cotton Wilt",
        "symptoms": ["Wilting leaves", "Yellowing", "Brown discoloration", "Plant death"],
        "severity": "Severe",
        "treatment": "Remove infected plants, apply fungicide to soil",
        "prevention": "Crop rotation, resistant varieties",
        "organic_remedy": "Trichoderma bio-fungicide application",
        "chemical_remedy": "Carbendazim 50% WP @ 1g/L water"
    },
    "rice_blast": {
        "name": "Rice Blast",
        "symptoms": ["Diamond-shaped spots on leaves", "Gray/brown centers", "Yellow halos"],
        "severity": "Severe",
        "treatment": "Apply fungicide immediately, use resistant varieties",
        "prevention": "Seed treatment with fungicide, balanced nitrogen fertilizer",
        "organic_remedy": "Chitosan spray (0.5%) every 10 days",
        "chemical_remedy": "Tricyclazole 75% WP @ 0.6g/L water"
    },
    "rice_leaf_blast": {
        "name": "Rice Leaf Blast",
        "symptoms": ["Elliptical spots with gray center", "Brown margins", "Leaf drying"],
        "severity": "Moderate",
        "treatment": "Apply systemic fungicide immediately",
        "prevention": "Use disease-free seeds, avoid excess nitrogen",
        "organic_remedy": "Silicic acid spray",
        "chemical_remedy": "Fungicide spray containing tricyclazole"
    },
    "wheat_rust": {
        "name": "Wheat Rust",
        "symptoms": ["Orange/brown powdery spots on leaves", "Yellowing", "Reduced growth"],
        "severity": "Severe",
        "treatment": "Apply fungicide at early stages, remove infected leaves",
        "prevention": "Resistant varieties, proper spacing",
        "organic_remedy": "Bordeaux mixture spray",
        "chemical_remedy": "Propiconazole 25% EC @ 1ml/L water"
    },
    "wheat_stem_rust": {
        "name": "Wheat Stem Rust",
        "symptoms": ["Brown/black pustules on stems", "Weak stalks", "Poor grain fill"],
        "severity": "Severe",
        "treatment": "Early application of fungicide, remove alternate host plants",
        "prevention": "Stubble management, resistant varieties",
        "organic_remedy": "Garlic extract spray",
        "chemical_remedy": "Strobilurin fungicides"
    },
    "potato_blight": {
        "name": "Potato Blight",
        "symptoms": ["Dark brown spots on leaves", "White mold on underside", "Tubers affected"],
        "severity": "Severe",
        "treatment": "Destroy infected plants, apply protective fungicides",
        "prevention": "Use certified seed potatoes, proper spacing",
        "organic_remedy": "Copper sulfate spray",
        "chemical_remedy": "Mancozeb + Metalaxyl formulation"
    },
    "early_blight": {
        "name": "Early Blight",
        "symptoms": ["Dark circular spots with concentric rings", "Yellowing around spots", "Leaf drop"],
        "severity": "Moderate",
        "treatment": "Apply fungicide, remove infected leaves, improve air circulation",
        "prevention": "Crop rotation, avoid overhead irrigation",
        "organic_remedy": "Baking soda solution (1 tbsp per gallon)",
        "chemical_remedy": "Chlorothalonil 75% WP @ 2g/L water"
    }
}

def analyze_image_with_ai(image_path: str) -> dict:
    """
    Simple image analysis using OpenCV.
    In production, this would use a trained CNN model.
    """
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return None
        
        # Basic image analysis
        height, width, channels = img.shape
        
        # Convert to HSV for color analysis
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Calculate average color
        avg_color_per_row = np.average(img, axis=0)
        avg_color = np.average(avg_color_per_row, axis=0)
        
        # Check for leaf color changes (simplified)
        # If image is more yellow/brown, it might have disease
        avg_hsv = np.average(hsv, axis=(0, 1))
        avg_h = avg_hsv[0]
        
        # Use average color to guess disease type
        # This is a simplified placeholder - in production, use CNN
        return {
            "color": avg_color,
            "hue": avg_h,
            "saturation": avg_hsv[1],
            "value": avg_hsv[2],
            "width": width,
            "height": height
        }
    except Exception as e:
        print(f"Image analysis error: {str(e)}")
        return None

def get_disease_recommendation(disease_key: str) -> dict:
    """Get disease details from database"""
    disease = DISEASE_DB.get(disease_key)
    if disease:
        return disease
    # Return default if not found
    return {
        "name": "Unknown Disease",
        "symptoms": ["Check for unusual spots", "Monitor leaf color changes"],
        "severity": "Unknown",
        "treatment": "Consult local agricultural officer",
        "prevention": "Regular monitoring, proper crop management",
        "organic_remedy": "Use neem oil spray",
        "chemical_remedy": "Seek professional advice"
    }

@router.post("/detect", response_model=DiseaseDetectionResponse)
async def detect_disease(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Detect disease from leaf image"""
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save image
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Analyze image
        image_data = analyze_image_with_ai(file_path)
        
        if not image_data:
            raise HTTPException(status_code=400, detail="Could not analyze image")
        
        # For demo, use a simple heuristic to select disease
        # In production, use a trained CNN model
        hue = image_data.get("hue", 0)
        
        # Simple classification based on color (placeholder for demo)
        disease_key = "tomato_leaf_blight"  # Default
        
        if hue < 20:
            disease_key = "rice_blast"
        elif 20 <= hue < 40:
            disease_key = "tomato_leaf_mold"
        elif 40 <= hue < 60:
            disease_key = "wheat_rust"
        elif 60 <= hue < 80:
            disease_key = "potato_blight"
        elif 80 <= hue < 100:
            disease_key = "early_blight"
        elif 100 <= hue < 120:
            disease_key = "cotton_wilt"
        else:
            disease_key = "tomato_leaf_blight"
        
        # Get disease details
        disease_info = get_disease_recommendation(disease_key)
        
        # Get AI-powered treatment recommendation
        treatment_response = await get_ai_treatment(
            disease_info["name"],
            disease_info["symptoms"],
            current_user
        )
        
        return DiseaseDetectionResponse(
            disease_name=disease_info["name"],
            confidence=round(78 + (image_data.get("saturation", 50) / 10), 1),
            severity=disease_info["severity"],
            symptoms=disease_info["symptoms"],
            treatment=treatment_response["treatment"] if treatment_response else disease_info["treatment"],
            prevention=disease_info["prevention"],
            organic_remedy=disease_info["organic_remedy"],
            chemical_remedy=disease_info["chemical_remedy"],
            detected_at=datetime.now()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in disease detection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

async def get_ai_treatment(disease_name: str, symptoms: List[str], user: User) -> dict:
    """Get AI-powered treatment recommendation"""
    try:
        from groq import Groq
        import os
        
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        prompt = f"""You are an expert agricultural advisor helping an Indian farmer.
        
Disease: {disease_name}
Symptoms: {', '.join(symptoms)}

Provide a detailed treatment plan for this disease including:
1. Immediate actions to take
2. Recommended organic treatments
3. Recommended chemical treatments
4. Prevention tips for future

Provide practical, actionable advice in simple language."""

        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are an expert agricultural advisor for Indian farmers. Provide practical, actionable advice."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=512,
            temperature=0.7
        )
        
        return {
            "treatment": response.choices[0].message.content
        }
        
    except Exception as e:
        print(f"AI treatment error: {str(e)}")
        return None