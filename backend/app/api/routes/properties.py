from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.database.repository import PropertyRepository
from backend.app.schemas.property import (
    PropertyListResponse,
    PropertyResponse,
    CityStatResponse
)

router = APIRouter(tags=["Properties & Locations"])

@router.get("/api/properties", response_model=PropertyListResponse)
def get_properties(
    city: Optional[str] = Query(None, description="Filter by city"),
    locality: Optional[str] = Query(None, description="Search by locality"),
    property_type: Optional[str] = Query(None, description="Apartment, Independent House, Villa"),
    bhk: Optional[int] = Query(None, ge=1, le=10, description="Bedrooms count"),
    min_price_lakhs: Optional[float] = Query(None, ge=0, description="Minimum price in Lakhs"),
    max_price_lakhs: Optional[float] = Query(None, ge=0, description="Maximum price in Lakhs"),
    min_area: Optional[float] = Query(None, ge=0, description="Minimum area in sq ft"),
    max_area: Optional[float] = Query(None, ge=0, description="Maximum area in sq ft"),
    sort_by: str = Query("relevance", description="relevance, price_asc, price_desc, area_asc, area_desc, bhk_desc"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(12, ge=1, le=50, description="Items per page"),
    db: Session = Depends(get_db)
):
    return PropertyRepository.get_properties(
        db=db,
        city=city,
        locality=locality,
        property_type=property_type,
        bhk=bhk,
        min_price_lakhs=min_price_lakhs,
        max_price_lakhs=max_price_lakhs,
        min_area=min_area,
        max_area=max_area,
        sort_by=sort_by,
        page=page,
        page_size=page_size
    )

@router.get("/api/properties/{property_id}", response_model=PropertyResponse)
def get_property_by_id(property_id: str, db: Session = Depends(get_db)):
    prop = PropertyRepository.get_by_id(db, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail=f"Property '{property_id}' not found in catalogue.")
    return prop

@router.get("/api/locations/cities", response_model=List[CityStatResponse])
def get_cities(db: Session = Depends(get_db)):
    return PropertyRepository.get_cities(db)

@router.get("/api/locations/localities", response_model=List[str])
def get_localities(city: Optional[str] = Query(None), db: Session = Depends(get_db)):
    return PropertyRepository.get_localities(db, city)

@router.get("/api/properties/{property_id}/similar", response_model=List[PropertyResponse])
def get_similar_properties(
    property_id: str,
    limit: int = Query(4, ge=1, le=12),
    db: Session = Depends(get_db)
):
    similar = PropertyRepository.get_similar_properties(db, property_id, limit=limit)
    return similar
