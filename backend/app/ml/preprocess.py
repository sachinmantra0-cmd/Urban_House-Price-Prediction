import os
from pathlib import Path
from typing import Tuple, List, Dict, Any
import pandas as pd
import numpy as np
import joblib
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.model_selection import train_test_split

from backend.app.utils.logger import logger
from backend.app.utils.config import settings

CATEGORICAL_FEATURES = ["city", "property_type"]
NUMERICAL_FEATURES = ["bhk", "bathrooms", "area_sqft", "balcony", "area_per_bhk"]
ALL_RAW_FEATURES = ["city", "property_type", "bhk", "bathrooms", "area_sqft", "balcony"]

def add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Safely adds non-leaking feature transformations.
    Computes area_per_bhk: average space per bedroom/hall.
    """
    df = df.copy()
    # Avoid division by zero
    safe_bhk = df["bhk"].clip(lower=1)
    df["area_per_bhk"] = df["area_sqft"] / safe_bhk
    return df

def create_preprocessing_pipeline() -> ColumnTransformer:
    """
    Creates Scikit-learn ColumnTransformer for categorical and numerical features.
    """
    categorical_transformer = OneHotEncoder(
        handle_unknown="ignore",
        sparse_output=False
    )
    numerical_transformer = StandardScaler()

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
            ("num", numerical_transformer, NUMERICAL_FEATURES),
        ],
        remainder="drop"
    )
    return preprocessor

def prepare_data(
    df: pd.DataFrame,
    test_size: float = 0.2,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, ColumnTransformer, List[str]]:
    """
    Prepares train/test split and fits preprocessing pipeline strictly on training data.
    """
    logger.info("Adding feature engineering...")
    df_feat = add_engineered_features(df)
    
    X = df_feat[CATEGORICAL_FEATURES + NUMERICAL_FEATURES]
    y = df_feat["price_lakhs"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, shuffle=True
    )
    logger.info(f"Train samples: {len(X_train)}, Test samples: {len(X_test)}")
    
    preprocessor = create_preprocessing_pipeline()
    logger.info("Fitting preprocessing pipeline on training split only...")
    preprocessor.fit(X_train)
    
    # Extract feature names after One-Hot Encoding
    cat_encoder = preprocessor.named_transformers_["cat"]
    cat_feature_names = cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES).tolist()
    feature_names = cat_feature_names + NUMERICAL_FEATURES
    logger.info(f"Transformed feature count: {len(feature_names)} features: {feature_names}")
    
    return X_train, X_test, y_train, y_test, preprocessor, feature_names

if __name__ == "__main__":
    df = pd.read_csv(settings.PROCESSED_DATA_PATH)
    X_train, X_test, y_train, y_test, preprocessor, feature_names = prepare_data(df)
    print("Preprocessed successfully!")
    print("Features:", feature_names)
