from pydantic import BaseModel

class Swipe(BaseModel):
    room_id: str
    action: str  # "like" or "dislike"
