from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.database.repository import UserPreferencesRepository
from backend.app.schemas.property import PropertyResponse, FavouriteRequest

router = APIRouter(tags=["Favourites"])

@router.post("/api/favourites")
def add_favourite(payload: FavouriteRequest, db: Session = Depends(get_db)):
    success = UserPreferencesRepository.add_favourite(db, payload.property_id)
    return {"success": success, "property_id": payload.property_id}

@router.get("/api/favourites", response_model=List[PropertyResponse])
def get_favourites(db: Session = Depends(get_db)):
    return UserPreferencesRepository.get_favourites(db)

@router.delete("/api/favourites/{property_id}")
def remove_favourite(property_id: str, db: Session = Depends(get_db)):
    success = UserPreferencesRepository.remove_favourite(db, property_id)
    return {"success": success, "property_id": property_id}
