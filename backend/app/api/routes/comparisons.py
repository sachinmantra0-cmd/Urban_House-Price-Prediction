from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.database.repository import UserPreferencesRepository
from backend.app.schemas.property import PropertyResponse, ComparisonRequest

router = APIRouter(tags=["Comparisons"])

@router.post("/api/comparisons")
def add_comparison(payload: ComparisonRequest, db: Session = Depends(get_db)):
    success = UserPreferencesRepository.add_comparison(db, payload.property_id)
    return {"success": success, "property_id": payload.property_id}

@router.get("/api/comparisons", response_model=List[PropertyResponse])
def get_comparisons(db: Session = Depends(get_db)):
    return UserPreferencesRepository.get_comparisons(db)

@router.delete("/api/comparisons/{property_id}")
def remove_comparison(property_id: str, db: Session = Depends(get_db)):
    success = UserPreferencesRepository.remove_comparison(db, property_id)
    return {"success": success, "property_id": property_id}
