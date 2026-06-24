from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import os

from app.core.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.api.v1.farm import get_current_user
from app.schemas.schemes import (
    SchemeRequest,
    SchemeResponse,
    SchemeComparison,
    SchemeEligibilityRequest
)

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])

# Comprehensive scheme database
SCHEMES = [
    {
        "name": "PM-KISAN",
        "type": "Central",
        "description": "Pradhan Mantri Kisan Samman Nidhi - Direct income support of ₹6,000 per year to small and marginal farmers",
        "eligibility": [
            "Small and marginal farmers with up to 2 hectares of land",
            "Must have valid Aadhaar and bank account",
            "Land ownership documents required"
        ],
        "benefits": "₹6,000 per year (₹2,000 every 4 months)",
        "financial_benefit": 6000,
        "application_process": [
            "Visit PM-KISAN portal (pmkisan.gov.in)",
            "Register with Aadhaar and land records",
            "Verify bank account details",
            "Approval within 30 days"
        ],
        "deadline": "Ongoing - Register anytime",
        "website": "https://pmkisan.gov.in",
        "helpline": "011-23381092",
        "state_specific": {}
    },
    {
        "name": "Pradhan Mantri Fasal Bima Yojana",
        "type": "Central",
        "description": "Crop insurance scheme providing financial support to farmers in case of crop failure due to natural calamities",
        "eligibility": [
            "All farmers growing notified crops",
            "Must have sown the crop in notified area",
            "Must pay premium (2% for Kharif, 1.5% for Rabi)"
        ],
        "benefits": "Insurance coverage up to 100% of sum insured",
        "financial_benefit": 25000,
        "application_process": [
            "Contact nearest agriculture office",
            "Fill crop insurance application",
            "Pay premium amount",
            "Submit before notified date"
        ],
        "deadline": "Before sowing season (Kharif: July, Rabi: November)",
        "website": "https://pmfby.gov.in",
        "helpline": "1800-180-1555",
        "state_specific": {}
    },
    {
        "name": "Soil Health Card Scheme",
        "type": "Central",
        "description": "Provides soil health cards to farmers with recommendations on fertilizer usage",
        "eligibility": [
            "All farmers can apply",
            "Must have agricultural land",
            "No income criteria"
        ],
        "benefits": "Free soil testing and recommendations",
        "financial_benefit": 0,
        "application_process": [
            "Visit nearest soil testing laboratory",
            "Submit soil samples",
            "Receive Soil Health Card within 15 days",
            "Follow fertilizer recommendations"
        ],
        "deadline": "Ongoing - Apply anytime",
        "website": "https://soilhealth.dac.gov.in",
        "helpline": "011-23381092",
        "state_specific": {}
    },
    {
        "name": "E-National Agriculture Market (e-NAM)",
        "type": "Central",
        "description": "Online trading platform for agricultural commodities connecting farmers to buyers",
        "eligibility": [
            "Farmers with agricultural produce",
            "Must register on e-NAM portal",
            "Valid Aadhaar and bank account"
        ],
        "benefits": "Better price discovery, reduced transaction costs",
        "financial_benefit": 15000,
        "application_process": [
            "Register on e-NAM portal",
            "Get training on platform usage",
            "List produce for auction",
            "Receive payment directly in bank account"
        ],
        "deadline": "Ongoing - Register anytime",
        "website": "https://enam.gov.in",
        "helpline": "1800-120-6384",
        "state_specific": {}
    },
    {
        "name": "Kisan Credit Card (KCC)",
        "type": "Central",
        "description": "Credit card for farmers providing short-term credit for agricultural needs",
        "eligibility": [
            "All farmers (individuals and groups)",
            "Must have land ownership documents",
            "No default history"
        ],
        "benefits": "Credit limit up to ₹3 lakhs at low interest rate",
        "financial_benefit": 50000,
        "application_process": [
            "Visit nearest bank branch",
            "Fill KCC application form",
            "Submit land documents and KYC",
            "Approval within 15 days"
        ],
        "deadline": "Ongoing - Apply anytime",
        "website": "https://www.nabard.org",
        "helpline": "1800-233-6333",
        "state_specific": {}
    },
    {
        "name": "Agriculture Infrastructure Fund",
        "type": "Central",
        "description": "Financing for setting up agricultural infrastructure like cold storage, processing units",
        "eligibility": [
            "Farmers, FPOs, cooperatives",
            "Should have land or facility for infrastructure",
            "Business plan required"
        ],
        "benefits": "Low-interest loans up to ₹2 crore",
        "financial_benefit": 100000,
        "application_process": [
            "Prepare business plan",
            "Apply through bank or online portal",
            "Submit project details",
            "Approval and disbursement"
        ],
        "deadline": "Ongoing - Apply anytime",
        "website": "https://agriinfra.dac.gov.in",
        "helpline": "011-23381092",
        "state_specific": {}
    }
]

# State-specific schemes
STATE_SCHEMES = {
    "Andhra Pradesh": [
        {
            "name": "Rythu Bharosa",
            "type": "State",
            "description": "Financial assistance of ₹13,500 per year to farmers",
            "eligibility": ["All farmers with land records"],
            "benefits": "₹13,500 per year",
            "financial_benefit": 13500,
            "application_process": ["Apply through village agriculture officer"],
            "deadline": "Ongoing",
            "website": "https://apagrisnet.gov.in",
            "helpline": "1800-425-2345"
        }
    ],
    "Karnataka": [
        {
            "name": "Raitha Bandhu",
            "type": "State",
            "description": "Financial assistance for farmers in Karnataka",
            "eligibility": ["Farmers with land records"],
            "benefits": "₹10,000 per year",
            "financial_benefit": 10000,
            "application_process": ["Apply through Gram Panchayat"],
            "deadline": "Ongoing",
            "website": "https://raithabandhu.karnataka.gov.in",
            "helpline": "1800-425-2345"
        }
    ],
    "Maharashtra": [
        {
            "name": "Maharashtra Crop Insurance Scheme",
            "type": "State",
            "description": "State-specific crop insurance for Maharashtra farmers",
            "eligibility": ["Farmers growing notified crops"],
            "benefits": "Insurance coverage up to ₹50,000",
            "financial_benefit": 50000,
            "application_process": ["Apply through agriculture department"],
            "deadline": "Before sowing season",
            "website": "https://mahagri.gov.in",
            "helpline": "1800-222-333"
        }
    ]
}

def check_eligibility(scheme: dict, request: SchemeRequest) -> tuple[bool, int]:
    """Check if farmer is eligible for a scheme"""
    score = 0
    eligible = True
    
    # Check for PM-KISAN
    if "PM-KISAN" in scheme["name"]:
        if request.farm_size > 5:  # More than 5 acres
            eligible = False
        else:
            score += 30
    
    # Check for Fasal Bima
    if "Fasal Bima" in scheme["name"]:
        if request.crop_type:
            score += 20
        else:
            score += 10
    
    # Check for Soil Health Card
    if "Soil Health" in scheme["name"]:
        score += 40  # Everyone eligible
    
    # Check for e-NAM
    if "e-NAM" in scheme["name"]:
        if request.farm_size >= 1:
            score += 20
    
    # Check for KCC
    if "KCC" in scheme["name"]:
        if request.farm_size >= 1:
            score += 25
    
    # Category-based benefits
    if request.category in ["SC", "ST"]:
        score += 10
    
    if request.farmer_type == "Small":
        score += 10
    
    return eligible, min(score + 30, 100)

@router.post("/recommend", response_model=List[SchemeResponse])
async def recommend_schemes(
    request: SchemeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recommended government schemes based on farm profile"""
    try:
        recommendations = []
        
        # Check central schemes
        for scheme in SCHEMES:
            is_eligible, score = check_eligibility(scheme, request)
            
            # Add state-specific info if available
            state_info = ""
            if request.state in STATE_SCHEMES:
                for state_scheme in STATE_SCHEMES[request.state]:
                    if state_scheme["name"] in scheme["name"]:
                        state_info = f" (State component available in {request.state})"
            
            recommendations.append(SchemeResponse(
                scheme_name=scheme["name"],
                scheme_type=scheme["type"],
                description=scheme["description"] + state_info,
                eligibility_criteria=scheme["eligibility"],
                benefits=scheme["benefits"],
                financial_benefit=scheme["financial_benefit"],
                application_process=scheme["application_process"],
                deadline=scheme.get("deadline", "Ongoing"),
                website=scheme.get("website", "https://agriculture.gov.in"),
                helpline=scheme.get("helpline", "Contact local agriculture office"),
                is_eligible=is_eligible,
                match_score=score
            ))
        
        # Add state-specific schemes
        if request.state in STATE_SCHEMES:
            for scheme in STATE_SCHEMES[request.state]:
                # Check if not already added
                if not any(s.scheme_name == scheme["name"] for s in recommendations):
                    is_eligible, score = check_eligibility(scheme, request)
                    recommendations.append(SchemeResponse(
                        scheme_name=scheme["name"],
                        scheme_type=scheme["type"],
                        description=scheme["description"],
                        eligibility_criteria=scheme.get("eligibility", ["Check with local agriculture office"]),
                        benefits=scheme.get("benefits", "State-specific benefits"),
                        financial_benefit=scheme.get("financial_benefit", 0),
                        application_process=scheme.get("application_process", ["Contact local agriculture office"]),
                        deadline=scheme.get("deadline", "Ongoing"),
                        website=scheme.get("website", "https://agriculture.gov.in"),
                        helpline=scheme.get("helpline", "Contact local agriculture office"),
                        is_eligible=is_eligible,
                        match_score=score
                    ))
        
        # Sort by match score (highest first)
        recommendations.sort(key=lambda x: x.match_score, reverse=True)
        
        return recommendations
        
    except Exception as e:
        print(f"Error recommending schemes: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/eligibility-check")
async def check_scheme_eligibility(
    request: SchemeEligibilityRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check eligibility for a specific scheme"""
    try:
        # Find the scheme
        scheme = None
        for s in SCHEMES:
            if s["name"] == request.scheme_name:
                scheme = s
                break
        
        if not scheme:
            return {"eligible": False, "reason": "Scheme not found", "suggestions": []}
        
        # Check eligibility based on scheme type
        reasons = []
        suggestions = []
        is_eligible = True
        
        if "PM-KISAN" in request.scheme_name:
            if request.farm_size > 5:
                is_eligible = False
                reasons.append("Farm size exceeds 5 hectares limit")
                suggestions.append("Check with agriculture department for special cases")
            else:
                suggestions.append("Complete online registration on PM-KISAN portal")
        
        if "Fasal Bima" in request.scheme_name:
            if not request.crop_type:
                is_eligible = False
                reasons.append("Crop type not specified")
                suggestions.append("Contact agriculture office for notified crops")
        
        if "KCC" in request.scheme_name:
            suggestions.append("Visit nearest bank branch with land documents")
            suggestions.append("Maintain good credit history")
        
        return {
            "eligible": is_eligible,
            "reasons": reasons,
            "suggestions": suggestions,
            "scheme_name": request.scheme_name
        }
        
    except Exception as e:
        print(f"Error checking eligibility: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/categories")
async def get_scheme_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all scheme categories"""
    return {
        "categories": [
            "Income Support",
            "Insurance",
            "Credit & Finance",
            "Infrastructure",
            "Technology",
            "Training & Education"
        ],
        "schemes": [scheme["name"] for scheme in SCHEMES]
    }

@router.get("/deadlines")
async def get_upcoming_deadlines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get upcoming scheme deadlines"""
    today = datetime.now()
    upcoming = []
    
    for scheme in SCHEMES:
        if scheme["deadline"] != "Ongoing - Register anytime" and "Fasal Bima" in scheme["name"]:
            # Calculate next deadline
            month = today.month
            year = today.year
            if month < 7:
                deadline = datetime(year, 7, 31)
            elif month < 11:
                deadline = datetime(year, 11, 30)
            else:
                deadline = datetime(year + 1, 7, 31)
            
            days_remaining = (deadline - today).days
            if days_remaining > 0 and days_remaining < 60:
                upcoming.append({
                    "scheme_name": scheme["name"],
                    "deadline": deadline.strftime("%B %d, %Y"),
                    "days_remaining": days_remaining,
                    "priority": "High" if days_remaining < 30 else "Medium"
                })
    
    return upcoming