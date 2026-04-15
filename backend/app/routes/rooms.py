from fastapi import APIRouter, Depends, HTTPException
from app.models.room import Room
from app.services.firebase import db
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.post("/")
def add_room(room: Room, current_user=Depends(get_current_user)):
    try:
        db.collection("rooms").document(room.room_id).set(room.dict())
        return {"message": "Room added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def get_rooms(current_user=Depends(get_current_user)):
    try:
        rooms = []
        room_docs = db.collection("rooms").stream()
        
        for room_doc in room_docs:
            room_data = room_doc.to_dict()
            room_data["room_id"] = room_doc.id
            rooms.append(room_data)
            
        return rooms
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{room_id}")
def get_room(room_id: str, current_user=Depends(get_current_user)):
    try:
        room_doc = db.collection("rooms").document(room_id).get()
        
        if not room_doc.exists:
            raise HTTPException(status_code=404, detail="Room not found")
            
        room_data = room_doc.to_dict()
        room_data["room_id"] = room_doc.id
        return room_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
