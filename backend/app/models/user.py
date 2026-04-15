from pydantic import BaseModel
from typing import List, Optional

class UserOnboard(BaseModel):
    college: str
    min_budget: int
    max_budget: int
    preferred_room_types: List[str] = []
    priorities: List[dict] = []  # [{'id': 'dist', 'label': 'Distance to college'}]
    role: Optional[str] = 'student'
    max_distance_km: Optional[float] = 10.0  # Default distance
