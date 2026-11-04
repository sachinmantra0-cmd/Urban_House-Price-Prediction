import json
from fastapi import APIRouter, HTTPException
from backend.app.utils.config import settings
from backend.app.schemas.analytics import ModelInfoResponse, ModelMetricsResponse

router = APIRouter(tags=["Health & Model Info"])

@router.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "service": "HouseEstiMate Backend API",
        "version": "1.0.0",
        "model_loaded": (settings.MODEL_DIR / "best_model.joblib").exists(),
        "database_connected": True
    }

@router.get("/api/model-info", response_model=ModelInfoResponse)
def get_model_info():
    meta_path = settings.METRICS_DIR / "model_metadata.json"
    if not meta_path.exists():
        raise HTTPException(status_code=503, detail="Model metadata not found. Train model first.")
    with open(meta_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

@router.get("/api/metrics", response_model=ModelMetricsResponse)
def get_metrics():
    metrics_path = settings.METRICS_DIR / "metrics.json"
    if not metrics_path.exists():
        raise HTTPException(status_code=503, detail="Metrics not found. Train model first.")
    with open(metrics_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data
