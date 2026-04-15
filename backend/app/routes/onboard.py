from fastapi import APIRouter, Depends, HTTPException
from app.models.user import UserOnboard
from app.services.firebase import db
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/onboard", tags=["Onboarding"])

@router.post("/")
def onboard_user(user_data: UserOnboard, current_user=Depends(get_current_user)):
    try:
        print(f"Onboard request received for user: {current_user}")
        print(f"User data: {user_data}")
        
        user_id = current_user["uid"]
        
        # Check if user is already onboarded
        user_doc = db.collection("users").document(user_id).get()
        if user_doc.exists:
            print(f"User {user_id} already onboarded")
            raise HTTPException(status_code=400, detail="User already onboarded")
        
        # Store user preferences
        user_dict = user_data.dict()
        user_dict["user_id"] = user_id
        user_dict["email"] = current_user.get("email")
        
        print(f"Saving user data: {user_dict}")
        db.collection("users").document(user_id).set(user_dict)
        
        print(f"User {user_id} onboarded successfully")
        return {"message": "User onboarded successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in onboard_user: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
def get_onboard_status(current_user=Depends(get_current_user)):
    try:
        user_id = current_user["uid"]
        
        user_doc = db.collection("users").document(user_id).get()
        
        return {
            "is_onboarded": user_doc.exists,
            "user_data": user_doc.to_dict() if user_doc.exists else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
