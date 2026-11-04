import os
import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any
import pandas as pd
import numpy as np
import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

from backend.app.utils.logger import logger
from backend.app.utils.config import settings
from backend.app.ml.preprocess import prepare_data, CATEGORICAL_FEATURES, NUMERICAL_FEATURES, ALL_RAW_FEATURES

def evaluate_predictions(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Computes standard regression evaluation metrics on held-out test data.
    """
    mae = mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_true, y_pred)
    return {
        "MAE": round(float(mae), 4),
        "MSE": round(float(mse), 4),
        "RMSE": round(float(rmse), 4),
        "R2": round(float(r2), 4)
    }

def train_and_compare_models(csv_path: Path = None) -> Dict[str, Any]:
    """
    Trains Linear Regression, Decision Tree, Random Forest, Gradient Boosting,
    and XGBoost models. Evaluates on held-out test split, selects best performer,
    and persists artifacts.
    """
    path = csv_path or settings.PROCESSED_DATA_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"Processed dataset not found at {path}. Run data_loader first.")
    
    logger.info(f"Loading data from {path} for training...")
    df = pd.read_csv(path)
    
    X_train, X_test, y_train, y_test, preprocessor, feature_names = prepare_data(df)
    
    # Transform features
    X_train_trans = preprocessor.transform(X_train)
    X_test_trans = preprocessor.transform(X_test)
    
    models = {
        "Linear Regression": LinearRegression(),
        "Decision Tree": DecisionTreeRegressor(max_depth=7, min_samples_leaf=10, random_state=42),
        "Random Forest": RandomForestRegressor(n_estimators=150, max_depth=12, min_samples_leaf=4, random_state=42, n_jobs=-1),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=120, learning_rate=0.06, max_depth=4, random_state=42),
        "XGBoost": xgb.XGBRegressor(n_estimators=120, max_depth=4, learning_rate=0.06, subsample=0.8, colsample_bytree=0.8, reg_alpha=0.1, reg_lambda=1.0, random_state=42, n_jobs=-1)
    }
    
    comparison_results = {}
    fitted_models = {}
    
    models_dir = settings.MODEL_DIR
    metrics_dir = settings.METRICS_DIR
    plots_dir = settings.PLOTS_DIR
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(metrics_dir, exist_ok=True)
    os.makedirs(plots_dir, exist_ok=True)
    
    logger.info("Beginning model training and cross-comparison...")
    for name, model in models.items():
        start_t = time.time()
        logger.info(f"Training {name}...")
        model.fit(X_train_trans, y_train)
        duration = round(time.time() - start_t, 2)
        
        y_pred = model.predict(X_test_trans)
        metrics = evaluate_predictions(y_test, y_pred)
        metrics["training_time_seconds"] = duration
        comparison_results[name] = metrics
        fitted_models[name] = model
        
        # Save individual model checkpoint
        safe_name = name.lower().replace(" ", "_")
        joblib.dump(model, models_dir / f"{safe_name}.joblib")
        logger.info(f"[{name}] Completed in {duration}s -> R2: {metrics['R2']}, RMSE: {metrics['RMSE']} Lakhs, MAE: {metrics['MAE']} Lakhs")
    
    # Select best model based on R2 score on held-out test set
    best_model_name = max(comparison_results, key=lambda k: comparison_results[k]["R2"])
    best_model = fitted_models[best_model_name]
    logger.info(f"Best performing model selected: '{best_model_name}' with R2={comparison_results[best_model_name]['R2']}")
    
    best_model_path = models_dir / "best_model.joblib"
    preprocessor_path = models_dir / "preprocessing_pipeline.joblib"
    joblib.dump(best_model, best_model_path)
    joblib.dump(preprocessor, preprocessor_path)
    logger.info(f"Saved best model to {best_model_path}")
    logger.info(f"Saved preprocessing pipeline to {preprocessor_path}")
    
    # Save Feature Schema
    feature_schema = {
        "raw_features": ALL_RAW_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "numerical_features": NUMERICAL_FEATURES,
        "transformed_features": feature_names,
        "target": "price_lakhs",
        "target_display_unit": "INR (converted from Lakhs: ₹1 Lakh = 100,000 INR)",
        "cities": ["Bangalore", "Pune", "New Delhi", "Chennai", "Kolkata", "Mumbai", "Hyderabad"],
        "property_types": ["Apartment", "Independent House", "Villa"]
    }
    schema_path = models_dir / "feature_schema.json"
    with open(schema_path, "w", encoding="utf-8") as f:
        json.dump(feature_schema, f, indent=2)
    logger.info(f"Saved feature schema to {schema_path}")
    
    # Save Metrics
    metrics_payload = {
        "models": comparison_results,
        "best_model": best_model_name,
        "best_metrics": comparison_results[best_model_name],
        "test_samples": len(y_test),
        "train_samples": len(y_train),
        "total_samples": len(df),
        "timestamp": datetime.now().isoformat()
    }
    metrics_path = metrics_dir / "metrics.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)
    logger.info(f"Saved evaluation metrics to {metrics_path}")
    
    # Save Model Metadata
    model_metadata = {
        "model_name": best_model_name,
        "model_type": type(best_model).__name__,
        "dataset": "Real Estate Data from 7 Indian Cities (Kaggle)",
        "train_size": len(y_train),
        "test_size": len(y_test),
        "feature_count": len(feature_names),
        "test_r2": comparison_results[best_model_name]["R2"],
        "test_rmse_lakhs": comparison_results[best_model_name]["RMSE"],
        "test_mae_lakhs": comparison_results[best_model_name]["MAE"],
        "trained_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "random_state": 42
    }
    meta_path = metrics_dir / "model_metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(model_metadata, f, indent=2)
    logger.info(f"Saved model metadata to {meta_path}")
    
    # Generate Model Comparison Chart
    plt.figure(figsize=(10, 5))
    model_names_list = list(comparison_results.keys())
    r2_scores = [comparison_results[m]["R2"] for m in model_names_list]
    colors = ['#10b981' if m == best_model_name else '#64748b' for m in model_names_list]
    
    bars = plt.bar(model_names_list, r2_scores, color=colors, width=0.55)
    plt.title("Algorithm Comparison: Test R² Score (Held-out Test Split)", fontsize=14, fontweight="bold")
    plt.xlabel("Machine Learning Algorithm", fontsize=12)
    plt.ylabel("R² Score", fontsize=12)
    plt.ylim(0, 0.6)
    for bar in bars:
        h = bar.get_height()
        plt.annotate(f"{h:.3f}",
                     xy=(bar.get_x() + bar.get_width() / 2, h),
                     xytext=(0, 4), textcoords="offset points",
                     ha='center', va='bottom', fontweight='bold', fontsize=11)
    
    comparison_chart_path = plots_dir / "model_comparison.png"
    plt.savefig(comparison_chart_path, dpi=200)
    plt.close()
    logger.info(f"Saved model comparison plot to {comparison_chart_path}")
    
    return metrics_payload

if __name__ == "__main__":
    train_and_compare_models()
