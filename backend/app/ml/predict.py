import os
import json
from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
import joblib

from backend.app.utils.logger import logger
from backend.app.utils.config import settings
from backend.app.ml.explain import shap_service

def format_inr(price_inr: float) -> str:
    """
    Formats a numeric price in INR into standard Indian numbering format (Lakhs and Crores).
    E.g.: 4,500,000 -> '₹45 Lakh', 19,900,000 -> '₹1.99 Cr'
    """
    if price_inr >= 10_000_000:
        cr = price_inr / 10_000_000.0
        return f"₹{cr:.2f} Cr"
    elif price_inr >= 100_000:
        lakh = price_inr / 100_000.0
        return f"₹{lakh:.2f} Lakh"
    else:
        return f"₹{price_inr:,.0f}"

class PredictionEngine:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.metadata = {}
        self.is_loaded = False
        self._load()

    def _load(self):
        model_path = settings.MODEL_DIR / "best_model.joblib"
        prep_path = settings.MODEL_DIR / "preprocessing_pipeline.joblib"
        meta_path = settings.METRICS_DIR / "model_metadata.json"

        if not model_path.exists() or not prep_path.exists():
            logger.warning("PredictionEngine: Model or preprocessor not found.")
            return

        try:
            self.model = joblib.load(model_path)
            self.preprocessor = joblib.load(prep_path)
            if meta_path.exists():
                with open(meta_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            self.is_loaded = True
            logger.info("PredictionEngine successfully loaded best model.")
        except Exception as e:
            logger.error(f"PredictionEngine load failed: {e}")

    def predict(
        self,
        city: str,
        property_type: str,
        bhk: int,
        bathrooms: int,
        area_sqft: float,
        balcony: int = 1,
        include_shap: bool = True
    ) -> Dict[str, Any]:
        """
        Runs ML inference and optional SHAP explanation on real inputs.
        """
        if not self.is_loaded:
            self._load()
            if not self.is_loaded:
                raise RuntimeError("ML model artifacts are missing. Run training pipeline first.")

        # Sanitize and validate
        valid_cities = ["Bangalore", "Pune", "New Delhi", "Chennai", "Kolkata", "Mumbai", "Hyderabad"]
        city_clean = city.title()
        if city_clean not in valid_cities:
            # Fallback or nearest metropolitan representation
            city_clean = "Bangalore"

        valid_types = ["Apartment", "Independent House", "Villa"]
        type_clean = property_type.title()
        if type_clean not in valid_types:
            type_clean = "Apartment"

        bhk_val = max(1, min(10, int(bhk)))
        bath_val = max(1, min(10, int(bathrooms)))
        area_val = max(150.0, min(12000.0, float(area_sqft)))
        balc_val = 1 if int(balcony) > 0 else 0
        area_per_bhk = area_val / bhk_val

        # Input dataframe matching preprocessing schema
        input_dict = {
            "city": city_clean,
            "property_type": type_clean,
            "bhk": bhk_val,
            "bathrooms": bath_val,
            "area_sqft": area_val,
            "balcony": balc_val,
            "area_per_bhk": area_per_bhk
        }
        input_df = pd.DataFrame([input_dict])

        # Preprocess features
        X_trans = self.preprocessor.transform(input_df)

        # Predict target in Lakhs
        pred_lakhs = float(self.model.predict(X_trans)[0])
        # Safeguard lower bound: minimum residential property value
        pred_lakhs = max(5.0, pred_lakhs)
        pred_inr = pred_lakhs * 100_000.0

        # Optional SHAP explanation
        explanation = None
        if include_shap and shap_service.is_initialized:
            try:
                explanation = shap_service.explain_instance(input_df, pred_lakhs)
            except Exception as e:
                logger.error(f"SHAP explanation generation error: {e}")

        return {
            "predicted_price_lakhs": round(pred_lakhs, 2),
            "predicted_price_inr": round(pred_inr, 2),
            "formatted_price": format_inr(pred_inr),
            "model_name": self.metadata.get("model_name", "Gradient Boosting Regressor"),
            "model_type": self.metadata.get("model_type", "GradientBoostingRegressor"),
            "input_features": {
                "city": city_clean,
                "property_type": type_clean,
                "bhk": bhk_val,
                "bathrooms": bath_val,
                "area_sqft": area_val,
                "balcony": balc_val,
                "area_per_bhk": round(area_per_bhk, 1)
            },
            "explanation": explanation
        }

prediction_engine = PredictionEngine()
