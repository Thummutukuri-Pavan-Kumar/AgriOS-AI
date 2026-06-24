from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import os
import random

from app.core.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.alert import Alert
from app.api.v1.farm import get_current_user
from app.schemas.alert import (
    AlertCreate,
    AlertResponse,
    AlertUpdate,
    AlertCountResponse
)

router = APIRouter(prefix="/alerts", tags=["Alerts & Notifications"])

# Alert templates
ALERT_TEMPLATES = {
    "disease": {
        "title": "Disease Detected in {crop}",
        "message": "Potential {disease} detected in your {crop} crop. Recommended action: {action}",
        "priority": "High"
    },
    "weather": {
        "title": "Weather Alert for {location}",
        "message": "{weather} expected in your area. Recommended action: {action}",
        "priority": "Medium"
    },
    "irrigation": {
        "title": "Irrigation Reminder",
        "message": "Time to irrigate your {crop} crops. Last irrigation: {last_irrigation} days ago.",
        "priority": "Medium"
    },
    "market": {
        "title": "Price Alert for {crop}",
        "message": "{crop} price has {trend} by {change}%. Current price: ₹{price}/ton",
        "priority": "High"
    },
    "scheme": {
        "title": "Scheme Deadline Approaching",
        "message": "Application deadline for {scheme} is in {days} days. Apply now!",
        "priority": "High"
    },
    "system": {
        "title": "System Update",
        "message": "{message}",
        "priority": "Low"
    }
}

@router.get("/", response_model=List[AlertResponse])
async def get_alerts(
    limit: int = 50,
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all alerts for the current user"""
    try:
        query = db.query(Alert).filter(Alert.user_id == current_user.id)
        
        if unread_only:
            query = query.filter(Alert.is_read == False)
        
        alerts = query.order_by(Alert.created_at.desc()).limit(limit).all()
        return alerts
        
    except Exception as e:
        print(f"Error getting alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/", response_model=AlertResponse)
async def create_alert(
    alert_data: AlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new alert"""
    try:
        alert = Alert(
            user_id=current_user.id,
            alert_type=alert_data.alert_type,
            title=alert_data.title,
            message=alert_data.message,
            priority=alert_data.priority,
            action_url=alert_data.action_url,
            crop_type=alert_data.crop_type
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert
        
    except Exception as e:
        db.rollback()
        print(f"Error creating alert: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.put("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: int,
    alert_data: AlertUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark alert as read/unread"""
    try:
        alert = db.query(Alert).filter(
            Alert.id == alert_id,
            Alert.user_id == current_user.id
        ).first()
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        alert.is_read = alert_data.is_read
        if alert_data.is_read:
            alert.read_at = datetime.now()
        
        db.commit()
        db.refresh(alert)
        return alert
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error updating alert: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.delete("/{alert_id}")
async def delete_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an alert"""
    try:
        alert = db.query(Alert).filter(
            Alert.id == alert_id,
            Alert.user_id == current_user.id
        ).first()
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        db.delete(alert)
        db.commit()
        return {"message": "Alert deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error deleting alert: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.delete("/clear-all")
async def clear_all_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete all alerts for the current user"""
    try:
        db.query(Alert).filter(Alert.user_id == current_user.id).delete()
        db.commit()
        return {"message": "All alerts cleared"}
        
    except Exception as e:
        db.rollback()
        print(f"Error clearing alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/count", response_model=AlertCountResponse)
async def get_alert_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get alert counts"""
    try:
        total = db.query(Alert).filter(Alert.user_id == current_user.id).count()
        unread = db.query(Alert).filter(
            Alert.user_id == current_user.id,
            Alert.is_read == False
        ).count()
        high_priority = db.query(Alert).filter(
            Alert.user_id == current_user.id,
            Alert.priority == "High",
            Alert.is_read == False
        ).count()
        
        return AlertCountResponse(
            total=total,
            unread=unread,
            high_priority=high_priority
        )
        
    except Exception as e:
        print(f"Error getting alert count: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/generate", response_model=List[AlertResponse])
async def generate_alerts(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate automatic alerts based on farm data"""
    try:
        alerts = []
        
        # Get farm data
        farm = db.query(Farm).filter(Farm.owner_id == current_user.id).first()
        if not farm:
            return []
        
        # 1. Weather Alert (simulated)
        weather_conditions = ["Heavy Rain", "Heatwave", "Strong Winds", "Frost"]
        weather = random.choice(weather_conditions)
        alerts.append(Alert(
            user_id=current_user.id,
            alert_type="Weather",
            title=f"Weather Alert for {farm.location_state}",
            message=f"{weather} expected in your area. Take necessary precautions.",
            priority="High" if weather in ["Heavy Rain", "Heatwave"] else "Medium",
            crop_type=None
        ))
        
        # 2. Market Alert (if crops exist)
        if farm.primary_crops and len(farm.primary_crops) > 0:
            crop = farm.primary_crops[0]
            trend = random.choice(["increased", "decreased"])
            change = round(random.uniform(2, 12), 1)
            price = round(random.uniform(20000, 30000), 2)
            
            alerts.append(Alert(
                user_id=current_user.id,
                alert_type="Market",
                title=f"Price Alert for {crop}",
                message=f"{crop} price has {trend} by {change}% in your region. Current price: ₹{price}/ton",
                priority="High" if change > 8 else "Medium",
                crop_type=crop
            ))
        
        # 3. Irrigation Reminder
        if farm.water_source:
            alerts.append(Alert(
                user_id=current_user.id,
                alert_type="Irrigation",
                title="Irrigation Reminder",
                message=f"Time to check irrigation for your farm. Soil moisture might be low.",
                priority="Medium",
                crop_type=None
            ))
        
        # 4. Scheme Reminder
        alerts.append(Alert(
            user_id=current_user.id,
            alert_type="Scheme",
            title="PM-KISAN Installment Reminder",
            message="Next PM-KISAN installment is due in 15 days. Ensure your bank account is active.",
            priority="High",
            crop_type=None
        ))
        
        # Save all alerts
        for alert in alerts:
            db.add(alert)
        
        db.commit()
        
        # Refresh to get IDs
        for alert in alerts:
            db.refresh(alert)
        
        return alerts
        
    except Exception as e:
        db.rollback()
        print(f"Error generating alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")