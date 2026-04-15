from fastapi import APIRouter, Depends, HTTPException
from app.services.firebase import db
from app.services.recommendation import score_room
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/rooms",
    tags=["Recommendations"]
)

@router.get("/recommend")
def recommend_rooms(current_user=Depends(get_current_user)):
    user_id = current_user["uid"]

    user_doc = db.collection("users").document(user_id).get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not onboarded")

    user = user_doc.to_dict()

    rooms = db.collection("rooms").stream()
    scored_rooms = []

    for room in rooms:
        room_data = room.to_dict()
        room_data["room_id"] = room.id
        room_data["score"] = score_room(room_data, user)
        scored_rooms.append(room_data)

    scored_rooms.sort(key=lambda x: x["score"], reverse=True)
    return scored_rooms
