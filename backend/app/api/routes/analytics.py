import json
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
import pandas as pd

from backend.app.utils.config import settings
from backend.app.ml.explain import shap_service
from backend.app.schemas.analytics import (
    AnalyticsOverviewResponse,
    FeatureImportanceItem,
    PriceDistributionBin
)

router = APIRouter(tags=["Analytics & Insights"])

@router.get("/api/analytics/overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview():
    eda_path = settings.METRICS_DIR / "eda_summary.json"
    if not eda_path.exists():
        raise HTTPException(status_code=503, detail="Analytics data not found. Run EDA script first.")
    with open(eda_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    return {
        "dataset_name": data.get("dataset_name", "Indian 7-City Real Estate Dataset"),
        "total_catalogue_properties": data.get("total_records", 0),
        "supported_cities_count": len(data.get("cities", {})),
        "cities": data.get("cities", {}),
        "property_types": data.get("property_types", {}),
        "price_stats_lakhs": data.get("price_stats_lakhs", {}),
        "area_stats_sqft": data.get("area_stats_sqft", {}),
        "bhk_distribution": data.get("bhk_distribution", {})
    }

@router.get("/api/analytics/price-distribution", response_model=List[PriceDistributionBin])
def get_price_distribution():
    processed_path = settings.PROCESSED_DATA_PATH
    if not processed_path.exists():
        raise HTTPException(status_code=503, detail="Processed dataset not found.")

    df = pd.read_csv(processed_path)
    # Define realistic price brackets in Lakhs
    bins = [0, 30, 60, 100, 150, 250, 500, 4000]
    labels = ["< ₹30L", "₹30L - ₹60L", "₹60L - ₹1Cr", "₹1Cr - ₹1.5Cr", "₹1.5Cr - ₹2.5Cr", "₹2.5Cr - ₹5Cr", "> ₹5Cr"]
    
    df["price_bin"] = pd.cut(df["price_lakhs"], bins=bins, labels=labels, right=False)
    counts = df["price_bin"].value_counts(sort=False)

    result = []
    for (label, count), (min_b, max_b) in zip(counts.items(), zip(bins[:-1], bins[1:])):
        result.append({
            "range_label": str(label),
            "min_lakhs": float(min_b),
            "max_lakhs": float(max_b),
            "count": int(count)
        })
    return result

@router.get("/api/analytics/feature-importance", response_model=List[FeatureImportanceItem])
def get_feature_importance():
    importance = shap_service.get_global_importance()
    if not importance:
        # Fallback or compute
        shap_service._compute_global_importance()
        importance = shap_service.get_global_importance()
    return importance
