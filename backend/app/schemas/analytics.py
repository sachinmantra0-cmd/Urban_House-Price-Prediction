from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ModelInfoResponse(BaseModel):
    model_name: str
    model_type: str
    dataset: str
    train_size: int
    test_size: int
    feature_count: int
    test_r2: float
    test_rmse_lakhs: float
    test_mae_lakhs: float
    trained_at: str

class ModelMetricsResponse(BaseModel):
    models: Dict[str, Any]
    best_model: str
    best_metrics: Dict[str, Any]
    test_samples: int
    train_samples: int
    total_samples: int
    timestamp: str

class FeatureImportanceItem(BaseModel):
    feature: str
    display_name: str
    importance_lakhs: float
    importance_inr: float

class PriceDistributionBin(BaseModel):
    range_label: str
    min_lakhs: float
    max_lakhs: float
    count: int

class AnalyticsOverviewResponse(BaseModel):
    dataset_name: str
    total_catalogue_properties: int
    supported_cities_count: int
    cities: Dict[str, int]
    property_types: Dict[str, int]
    price_stats_lakhs: Dict[str, float]
    area_stats_sqft: Dict[str, float]
    bhk_distribution: Dict[str, int]
