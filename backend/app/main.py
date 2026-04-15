from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.firebase import db
from app.routes.onboard import router as onboard_router
from app.routes.rooms import router as rooms_router
from app.routes.recommend import router as recommend_router
from app.routes.swipe import router as swipe_router

app = FastAPI()

# Add CORS middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Student Rental Backend Running"}

@app.get("/test-db")
def test_db():
    doc_ref = db.collection("test").document("hello")
    doc_ref.set({"msg": "Firestore connected"})
    return {"status": "success"}

app.include_router(onboard_router, prefix="")
app.include_router(rooms_router, prefix="")
app.include_router(recommend_router, prefix="")
app.include_router(swipe_router, prefix="")