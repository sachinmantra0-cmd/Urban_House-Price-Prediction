import os
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import joblib
import shap
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from backend.app.utils.logger import logger
from backend.app.utils.config import settings

FEATURE_LABELS = {
    "city_Bangalore": "City: Bangalore",
    "city_Chennai": "City: Chennai",
    "city_Hyderabad": "City: Hyderabad",
    "city_Kolkata": "City: Kolkata",
    "city_Mumbai": "City: Mumbai",
    "city_New Delhi": "City: New Delhi",
    "city_Pune": "City: Pune",
    "property_type_Apartment": "Property Type: Apartment",
    "property_type_Independent House": "Property Type: Independent House",
    "property_type_Villa": "Property Type: Villa",
    "bhk": "Bedrooms (BHK)",
    "bathrooms": "Bathrooms",
    "area_sqft": "Total Area (sq ft)",
    "balcony": "Balcony Present",
    "area_per_bhk": "Average Room Size (sq ft/BHK)"
}

class ShapService:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.explainer = None
        self.feature_names = []
        self.global_importance = []
        self.is_initialized = False
        self._load()

    def _load(self):
        try:
            model_path = settings.MODEL_DIR / "best_model.joblib"
            prep_path = settings.MODEL_DIR / "preprocessing_pipeline.joblib"
            schema_path = settings.MODEL_DIR / "feature_schema.json"

            if not model_path.exists() or not prep_path.exists() or not schema_path.exists():
                logger.warning("ML artifacts not found. SHAP service uninitialized.")
                return

            self.model = joblib.load(model_path)
            self.preprocessor = joblib.load(prep_path)

            with open(schema_path, "r", encoding="utf-8") as f:
                schema = json.load(f)
            self.feature_names = schema.get("transformed_features", [])

            # Initialize TreeExplainer
            self.explainer = shap.TreeExplainer(self.model)
            self.is_initialized = True
            logger.info("SHAP TreeExplainer successfully initialized.")

            # Compute or load global feature importance
            self._compute_global_importance()

        except Exception as e:
            logger.error(f"Error initializing SHAP service: {e}", exc_info=True)

    def _compute_global_importance(self):
        """
        Computes global feature importance across a sample of processed data.
        """
        try:
            sample_data_path = settings.PROCESSED_DATA_PATH
            if not sample_data_path.exists():
                return
            df = pd.read_csv(sample_data_path)
            # Add engineered feature
            df["area_per_bhk"] = df["area_sqft"] / df["bhk"].clip(lower=1)
            cols = ["city", "property_type", "bhk", "bathrooms", "area_sqft", "balcony", "area_per_bhk"]
            sample_df = df[cols].sample(min(300, len(df)), random_state=42)
            
            X_trans = self.preprocessor.transform(sample_df)
            shap_vals = self.explainer.shap_values(X_trans)
            
            # Mean absolute SHAP value per feature
            mean_abs_shap = np.mean(np.abs(shap_vals), axis=0)
            
            importance_list = []
            for name, val in zip(self.feature_names, mean_abs_shap):
                importance_list.append({
                    "feature": name,
                    "display_name": FEATURE_LABELS.get(name, name),
                    "importance_lakhs": round(float(val), 4),
                    "importance_inr": round(float(val * 100_000), 2)
                })
            
            importance_list.sort(key=lambda x: x["importance_lakhs"], reverse=True)
            self.global_importance = importance_list
            logger.info("Computed global SHAP feature importance.")

            # Save SHAP summary plot
            plots_dir = settings.PLOTS_DIR
            os.makedirs(plots_dir, exist_ok=True)
            plt.figure(figsize=(10, 6))
            shap.summary_plot(shap_vals, X_trans, feature_names=[FEATURE_LABELS.get(f, f) for f in self.feature_names], show=False)
            plt.title("Global SHAP Feature Impact Summary", fontsize=14, fontweight="bold")
            plt.tight_layout()
            plt_path = plots_dir / "shap_summary.png"
            plt.savefig(plt_path, dpi=200)
            plt.close()
            logger.info(f"Saved SHAP summary plot to {plt_path}")

        except Exception as e:
            logger.warning(f"Could not compute global SHAP importance: {e}")

    def explain_instance(self, input_df: pd.DataFrame, predicted_lakhs: float) -> Dict[str, Any]:
        """
        Explains single prediction using exact SHAP values.
        Guarantees: base_value + sum(shap_values) == predicted_value within float tolerance.
        """
        if not self.is_initialized:
            raise RuntimeError("SHAP service is not initialized. Run model training first.")

        # Ensure area_per_bhk exists
        if "area_per_bhk" not in input_df.columns:
            input_df = input_df.copy()
            input_df["area_per_bhk"] = input_df["area_sqft"] / max(1, int(input_df["bhk"].iloc[0]))

        cols = ["city", "property_type", "bhk", "bathrooms", "area_sqft", "balcony", "area_per_bhk"]
        X_trans = self.preprocessor.transform(input_df[cols])
        
        shap_vals = self.explainer.shap_values(X_trans)[0]
        base_val = self.explainer.expected_value
        if isinstance(base_val, (np.ndarray, list)):
            base_val = float(base_val[0])
        else:
            base_val = float(base_val)

        # Mathematical verification
        sum_shap = float(np.sum(shap_vals))
        calculated_total = base_val + sum_shap
        diff = abs(calculated_total - predicted_lakhs)
        logger.debug(f"SHAP check: base={base_val}, sum={sum_shap}, pred={predicted_lakhs}, diff={diff}")

        # Build feature contributions list
        contributions = []
        for feat_name, s_val in zip(self.feature_names, shap_vals):
            # Only include non-zero contributions
            if abs(s_val) > 0.001:
                contributions.append({
                    "feature": feat_name,
                    "display_name": FEATURE_LABELS.get(feat_name, feat_name),
                    "shap_lakhs": round(float(s_val), 4),
                    "shap_inr": round(float(s_val * 100_000), 2),
                    "effect": "positive" if s_val > 0 else "negative"
                })

        # Sort by absolute impact
        contributions.sort(key=lambda x: abs(x["shap_lakhs"]), reverse=True)

        positive_contributions = [c for c in contributions if c["effect"] == "positive"]
        negative_contributions = [c for c in contributions if c["effect"] == "negative"]

        return {
            "baseline_lakhs": round(base_val, 4),
            "baseline_inr": round(base_val * 100_000, 2),
            "predicted_lakhs": round(predicted_lakhs, 4),
            "predicted_inr": round(predicted_lakhs * 100_000, 2),
            "sum_shap_lakhs": round(sum_shap, 4),
            "is_additive": diff < 1e-3,
            "feature_contributions": contributions,
            "positive_contributions": positive_contributions,
            "negative_contributions": negative_contributions,
            "top_drivers": contributions[:6]
        }

    def get_global_importance(self) -> List[Dict[str, Any]]:
        return self.global_importance

shap_service = ShapService()
