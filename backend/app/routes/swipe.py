from fastapi import APIRouter, Depends, HTTPException
from app.models.swipe import Swipe
from app.services.firebase import db
from app.dependencies.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/swipe", tags=["Swipe"])

@router.post("/")
def swipe_room(swipe_data: Swipe, current_user=Depends(get_current_user)):
    try:
        user_id = current_user["uid"]
        
        # Check if room exists
        room_doc = db.collection("rooms").document(swipe_data.room_id).get()
        if not room_doc.exists:
            raise HTTPException(status_code=404, detail="Room not found")
        
        # Record the swipe
        swipe_doc = {
            "user_id": user_id,
            "room_id": swipe_data.room_id,
            "action": swipe_data.action,
            "timestamp": datetime.utcnow()
        }
        
        db.collection("swipes").add(swipe_doc)
        
        return {"message": "Swipe recorded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
def get_swipe_history(current_user=Depends(get_current_user)):
    try:
        user_id = current_user["uid"]
        
        swipes = []
        swipe_docs = db.collection("swipes").where("user_id", "==", user_id).stream()
        
        for swipe_doc in swipe_docs:
            swipe_data = swipe_doc.to_dict()
            swipe_data["swipe_id"] = swipe_doc.id
            swipes.append(swipe_data)
            
        return swipes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
