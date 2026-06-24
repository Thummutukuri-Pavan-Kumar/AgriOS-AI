# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from typing import List
# from app.core.database import get_db
# from app.models.user import User
# from app.models.farm import Farm
# from app.schemas.farm import FarmCreate, FarmUpdate, FarmResponse
# from app.core.security import verify_token

# router = APIRouter(prefix="/farm", tags=["Farm Management"])

# def get_current_user(token: str, db: Session):
#     payload = verify_token(token)
#     if not payload:
#         raise HTTPException(status_code=401, detail="Invalid token")
#     user = db.query(User).filter(User.id == int(payload["sub"])).first()
#     if not user:
#         raise HTTPException(status_code=401, detail="User not found")
#     return user

# @router.post("/create", response_model=FarmResponse)
# def create_farm(
#     farm_data: FarmCreate,
#     db: Session = Depends(get_db),
#     token: str = Depends(lambda: None)  # Will be extracted from header
# ):
#     # Get user from token (we need to parse it properly)
#     # For now, we'll use a simpler approach - get from Authorization header
#     return {"error": "Implement auth properly"}

# # Better implementation with proper auth:
# @router.post("/create", response_model=FarmResponse)
# def create_farm(
#     farm_data: FarmCreate,
#     db: Session = Depends(get_db),
#     authorization: str = None
# ):
#     if not authorization or not authorization.startswith("Bearer "):
#         raise HTTPException(status_code=401, detail="Missing or invalid token")
    
#     token = authorization.split(" ")[1]
#     payload = verify_token(token)
#     if not payload:
#         raise HTTPException(status_code=401, detail="Invalid token")
    
#     user_id = int(payload["sub"])
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=401, detail="User not found")
    
#     # Create farm
#     farm = Farm(
#         owner_id=user_id,
#         farm_name=farm_data.farm_name,
#         location_state=farm_data.location_state,
#         location_district=farm_data.location_district,
#         total_area_acres=farm_data.total_area_acres,
#         soil_type=farm_data.soil_type,
#         primary_crops=farm_data.primary_crops,
#         water_source=farm_data.water_source,
#         health_score=75.0  # Default score, will be calculated properly later
#     )
#     db.add(farm)
#     db.commit()
#     db.refresh(farm)
#     return farm

# @router.get("/my-farm", response_model=FarmResponse)
# def get_my_farm(
#     db: Session = Depends(get_db),
#     authorization: str = None
# ):
#     if not authorization or not authorization.startswith("Bearer "):
#         raise HTTPException(status_code=401, detail="Missing or invalid token")
    
#     token = authorization.split(" ")[1]
#     payload = verify_token(token)
#     if not payload:
#         raise HTTPException(status_code=401, detail="Invalid token")
    
#     user_id = int(payload["sub"])
#     farm = db.query(Farm).filter(Farm.owner_id == user_id).first()
#     if not farm:
#         raise HTTPException(status_code=404, detail="Farm not found. Please create one.")
#     return farm

# @router.put("/update", response_model=FarmResponse)
# def update_farm(
#     farm_data: FarmUpdate,
#     db: Session = Depends(get_db),
#     authorization: str = None
# ):
#     if not authorization or not authorization.startswith("Bearer "):
#         raise HTTPException(status_code=401, detail="Missing or invalid token")
    
#     token = authorization.split(" ")[1]
#     payload = verify_token(token)
#     if not payload:
#         raise HTTPException(status_code=401, detail="Invalid token")
    
#     user_id = int(payload["sub"])
#     farm = db.query(Farm).filter(Farm.owner_id == user_id).first()
#     if not farm:
#         raise HTTPException(status_code=404, detail="Farm not found")
    
#     # Update only fields that are provided
#     for key, value in farm_data.dict(exclude_unset=True).items():
#         setattr(farm, key, value)
    
#     db.commit()
#     db.refresh(farm)
#     return farm

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.schemas.farm import FarmCreate, FarmUpdate, FarmResponse
from app.core.security import verify_token
from datetime import datetime

router = APIRouter(prefix="/farm", tags=["Farm Management"])

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Extract and verify token from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

@router.post("/create", response_model=FarmResponse)
def create_farm(
    farm_data: FarmCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new farm for the current user"""
    try:
        # Check if user already has a farm
        existing_farm = db.query(Farm).filter(Farm.owner_id == current_user.id).first()
        if existing_farm:
            raise HTTPException(status_code=400, detail="You already have a farm. Use UPDATE instead.")
        
        # Create farm with explicit datetime
        now = datetime.now()
        farm = Farm(
            owner_id=current_user.id,
            farm_name=farm_data.farm_name,
            location_state=farm_data.location_state,
            location_district=farm_data.location_district,
            total_area_acres=farm_data.total_area_acres,
            soil_type=farm_data.soil_type,
            primary_crops=farm_data.primary_crops,
            water_source=farm_data.water_source,
            health_score=75.0,
            created_at=now,
            updated_at=now
        )
        db.add(farm)
        db.commit()
        db.refresh(farm)
        return farm
    except Exception as e:
        db.rollback()
        print(f"Error creating farm: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create farm: {str(e)}")

@router.get("/my-farm", response_model=FarmResponse)
def get_my_farm(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's farm"""
    try:
        farm = db.query(Farm).filter(Farm.owner_id == current_user.id).first()
        if not farm:
            raise HTTPException(status_code=404, detail="Farm not found. Please create one.")
        return farm
    except Exception as e:
        print(f"Error fetching farm: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch farm: {str(e)}")

@router.put("/update", response_model=FarmResponse)
def update_farm(
    farm_data: FarmUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the current user's farm"""
    try:
        farm = db.query(Farm).filter(Farm.owner_id == current_user.id).first()
        if not farm:
            raise HTTPException(status_code=404, detail="Farm not found. Please create one first.")
        
        # Update only fields that are provided
        update_data = farm_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(farm, key, value)
        
        # Update timestamp
        farm.updated_at = datetime.now()
        
        db.commit()
        db.refresh(farm)
        return farm
    except Exception as e:
        db.rollback()
        print(f"Error updating farm: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update farm: {str(e)}")

@router.delete("/delete")
def delete_farm(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete the current user's farm"""
    try:
        farm = db.query(Farm).filter(Farm.owner_id == current_user.id).first()
        if not farm:
            raise HTTPException(status_code=404, detail="Farm not found")
        
        db.delete(farm)
        db.commit()
        return {"message": "Farm deleted successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting farm: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete farm: {str(e)}")