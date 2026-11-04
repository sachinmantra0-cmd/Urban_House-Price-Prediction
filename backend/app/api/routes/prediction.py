from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.database.repository import PropertyRepository, UserPreferencesRepository
from backend.app.ml.predict import prediction_engine
from backend.app.schemas.prediction import PredictRequest, PredictResponse

router = APIRouter(tags=["ML Price Prediction & SHAP"])

@router.post("/api/predict", response_model=PredictResponse)
def predict_custom_property(payload: PredictRequest, db: Session = Depends(get_db)):
    try:
        result = prediction_engine.predict(
            city=payload.city,
            property_type=payload.property_type,
            bhk=payload.bhk,
            bathrooms=payload.bathrooms,
            area_sqft=payload.area_sqft,
            balcony=payload.balcony,
            include_shap=True
        )

        # Record in history
        UserPreferencesRepository.add_prediction_history(db, {
            "property_id": None,
            "city": payload.city,
            "locality": payload.locality,
            "property_type": payload.property_type,
            "bhk": payload.bhk,
            "bathrooms": payload.bathrooms,
            "area_sqft": payload.area_sqft,
            "balcony": payload.balcony,
            "predicted_price_lakhs": result["predicted_price_lakhs"],
            "predicted_price_inr": result["predicted_price_inr"],
            "formatted_price": result["formatted_price"],
            "model_name": result["model_name"]
        })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/api/properties/{property_id}/predict", response_model=PredictResponse)
def predict_selected_property(property_id: str, db: Session = Depends(get_db)):
    prop = PropertyRepository.get_by_id(db, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail=f"Property '{property_id}' not found.")

    try:
        result = prediction_engine.predict(
            city=prop["city"],
            property_type=prop["property_type"],
            bhk=prop["bhk"],
            bathrooms=prop["bathrooms"],
            area_sqft=prop["area_sqft"],
            balcony=prop["balcony"],
            include_shap=True
        )

        # Record in history
        UserPreferencesRepository.add_prediction_history(db, {
            "property_id": property_id,
            "city": prop["city"],
            "locality": prop["locality"],
            "property_type": prop["property_type"],
            "bhk": prop["bhk"],
            "bathrooms": prop["bathrooms"],
            "area_sqft": prop["area_sqft"],
            "balcony": prop["balcony"],
            "predicted_price_lakhs": result["predicted_price_lakhs"],
            "predicted_price_inr": result["predicted_price_inr"],
            "formatted_price": result["formatted_price"],
            "model_name": result["model_name"]
        })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.get("/api/predictions/history")
def get_prediction_history(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return UserPreferencesRepository.get_prediction_history(db, limit=limit)
