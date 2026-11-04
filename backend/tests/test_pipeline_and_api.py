import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.ml.predict import prediction_engine, format_inr
from backend.app.ml.explain import shap_service

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["database_connected"] is True

def test_model_info_and_metrics():
    info_resp = client.get("/api/model-info")
    assert info_resp.status_code == 200
    info = info_resp.json()
    assert "model_name" in info
    assert info["test_r2"] > 0
    assert info["dataset"] == "Real Estate Data from 7 Indian Cities (Kaggle)"

    metrics_resp = client.get("/api/metrics")
    assert metrics_resp.status_code == 200
    metrics = metrics_resp.json()
    assert "models" in metrics
    assert len(metrics["models"]) >= 4

def test_properties_listing_and_filter():
    # Test all properties
    resp = client.get("/api/properties?page=1&page_size=6")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] > 10000
    assert len(data["items"]) == 6

    # Test filtering by city
    bangalore_resp = client.get("/api/properties?city=Bangalore&page=1&page_size=6")
    assert bangalore_resp.status_code == 200
    b_data = bangalore_resp.json()
    for item in b_data["items"]:
        assert item["city"] == "Bangalore"

    # Test filtering by BHK
    bhk3_resp = client.get("/api/properties?bhk=3&page=1&page_size=6")
    assert bhk3_resp.status_code == 200
    for item in bhk3_resp.json()["items"]:
        assert item["bhk"] == 3

def test_single_property_detail():
    resp = client.get("/api/properties/PROP_00001")
    assert resp.status_code == 200
    prop = resp.json()
    assert prop["property_id"] == "PROP_00001"
    assert len(prop["images"]) > 0
    assert "amenities" in prop

def test_similar_properties_recommendation():
    resp = client.get("/api/properties/PROP_00001/similar?limit=4")
    assert resp.status_code == 200
    similar = resp.json()
    assert len(similar) <= 4
    for s in similar:
        assert s["property_id"] != "PROP_00001"
        assert s["city"] == "Chennai"

def test_predict_custom_property():
    payload = {
        "city": "Mumbai",
        "property_type": "Apartment",
        "bhk": 2,
        "bathrooms": 2,
        "area_sqft": 850.0,
        "balcony": 1
    }
    resp = client.post("/api/predict", json=payload)
    assert resp.status_code == 200
    result = resp.json()
    assert result["predicted_price_lakhs"] > 0
    assert result["predicted_price_inr"] > 0
    assert "explanation" in result
    explanation = result["explanation"]
    assert explanation is not None
    assert explanation["is_additive"] is True
    # Mathematical check: baseline + sum(shap) == predicted within tolerance
    base_lakhs = explanation["baseline_lakhs"]
    sum_shap = explanation["sum_shap_lakhs"]
    pred_lakhs = explanation["predicted_lakhs"]
    assert abs((base_lakhs + sum_shap) - pred_lakhs) < 0.05

def test_predict_selected_property():
    resp = client.post("/api/properties/PROP_00001/predict")
    assert resp.status_code == 200
    result = resp.json()
    assert result["predicted_price_lakhs"] > 0
    assert result["explanation"]["is_additive"] is True

def test_favourites_flow():
    # Add to favourites
    add_resp = client.post("/api/favourites", json={"property_id": "PROP_00001"})
    assert add_resp.status_code == 200

    # Get favourites
    get_resp = client.get("/api/favourites")
    assert get_resp.status_code == 200
    fav_ids = [f["property_id"] for f in get_resp.json()]
    assert "PROP_00001" in fav_ids

    # Remove favourite
    del_resp = client.delete("/api/favourites/PROP_00001")
    assert del_resp.status_code == 200

def test_comparisons_flow():
    # Add to comparisons
    add_resp = client.post("/api/comparisons", json={"property_id": "PROP_00002"})
    assert add_resp.status_code == 200

    get_resp = client.get("/api/comparisons")
    assert get_resp.status_code == 200
    comp_ids = [c["property_id"] for c in get_resp.json()]
    assert "PROP_00002" in comp_ids

    # Remove
    del_resp = client.delete("/api/comparisons/PROP_00002")
    assert del_resp.status_code == 200

def test_analytics_endpoints():
    overview_resp = client.get("/api/analytics/overview")
    assert overview_resp.status_code == 200
    assert overview_resp.json()["total_catalogue_properties"] > 10000

    dist_resp = client.get("/api/analytics/price-distribution")
    assert dist_resp.status_code == 200
    assert len(dist_resp.json()) > 0

    imp_resp = client.get("/api/analytics/feature-importance")
    assert imp_resp.status_code == 200
    assert len(imp_resp.json()) > 0

def test_indian_price_formatting():
    assert format_inr(4500000) == "₹45.00 Lakh"
    assert format_inr(19900000) == "₹1.99 Cr"
    assert format_inr(12500000) == "₹1.25 Cr"
    assert format_inr(85000) == "₹85,000"
