from pydantic import BaseModel

class Room(BaseModel):
    room_id: str
    rent: int
    distance_km: float
    furnished: bool
    location: str
