import os
import json
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns

from backend.app.utils.logger import logger
from backend.app.utils.config import settings

def run_eda(csv_path: Path = None):
    """
    Performs comprehensive Exploratory Data Analysis,
    generates publication-quality charts, and saves summary statistics.
    """
    path = csv_path or settings.PROCESSED_DATA_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"Processed dataset not found at {path}. Run data_loader first.")
    
    logger.info(f"Running EDA on {path}...")
    df = pd.read_csv(path)
    
    plots_dir = settings.PLOTS_DIR
    metrics_dir = settings.METRICS_DIR
    os.makedirs(plots_dir, exist_ok=True)
    os.makedirs(metrics_dir, exist_ok=True)
    
    sns.set_theme(style="whitegrid", palette="muted")
    plt.rcParams.update({'font.sans-serif': 'DejaVu Sans', 'figure.autolayout': True})

    # 1. Price Distribution (Histogram + KDE)
    plt.figure(figsize=(10, 5))
    sns.histplot(df['price_lakhs'], bins=50, kde=True, color="#2563eb")
    plt.title("Indian Residential House Price Distribution (in Lakhs ₹)", fontsize=14, fontweight="bold")
    plt.xlabel("Price (₹ Lakhs)", fontsize=12)
    plt.ylabel("Frequency", fontsize=12)
    plt.xlim(0, 1000)  # Focus on primary density
    p_dist_path = plots_dir / "price_distribution.png"
    plt.savefig(p_dist_path, dpi=200)
    plt.close()
    logger.info(f"Saved {p_dist_path}")

    # 2. Price by City (Boxplot / Barplot)
    plt.figure(figsize=(10, 6))
    order = df.groupby('city')['price_lakhs'].median().sort_values(ascending=False).index
    sns.boxplot(x='city', y='price_lakhs', data=df, order=order, palette="Blues_r", showfliers=False)
    plt.title("Median House Price by City (₹ Lakhs, Outliers Hidden)", fontsize=14, fontweight="bold")
    plt.xlabel("City", fontsize=12)
    plt.ylabel("Price (₹ Lakhs)", fontsize=12)
    plt.xticks(rotation=20)
    p_city_path = plots_dir / "price_by_city.png"
    plt.savefig(p_city_path, dpi=200)
    plt.close()
    logger.info(f"Saved {p_city_path}")

    # 3. Area vs Price (Scatter plot with Trendline)
    plt.figure(figsize=(10, 6))
    sample = df.sample(min(2500, len(df)), random_state=42)
    sns.scatterplot(x='area_sqft', y='price_lakhs', hue='city', data=sample, alpha=0.6, palette="Set2")
    plt.title("Built-up Area (sq ft) vs House Price (₹ Lakhs)", fontsize=14, fontweight="bold")
    plt.xlabel("Area (sq ft)", fontsize=12)
    plt.ylabel("Price (₹ Lakhs)", fontsize=12)
    plt.xlim(0, 6000)
    plt.ylim(0, 1000)
    p_area_path = plots_dir / "area_vs_price.png"
    plt.savefig(p_area_path, dpi=200)
    plt.close()
    logger.info(f"Saved {p_area_path}")

    # 4. BHK vs Price
    plt.figure(figsize=(10, 5))
    bhk_data = df[df['bhk'] <= 6]
    sns.barplot(x='bhk', y='price_lakhs', data=bhk_data, estimator=np.median, palette="crest", ci=None)
    plt.title("Median House Price by Bedroom Count (BHK)", fontsize=14, fontweight="bold")
    plt.xlabel("BHK", fontsize=12)
    plt.ylabel("Median Price (₹ Lakhs)", fontsize=12)
    p_bhk_path = plots_dir / "bhk_vs_price.png"
    plt.savefig(p_bhk_path, dpi=200)
    plt.close()
    logger.info(f"Saved {p_bhk_path}")

    # 5. Correlation Heatmap
    plt.figure(figsize=(8, 6))
    num_cols = ['bhk', 'bathrooms', 'area_sqft', 'balcony', 'price_lakhs']
    corr = df[num_cols].corr()
    sns.heatmap(corr, annot=True, cmap="coolwarm", fmt=".2f", linewidths=0.5)
    plt.title("Feature Correlation Heatmap", fontsize=14, fontweight="bold")
    p_corr_path = plots_dir / "correlation_heatmap.png"
    plt.savefig(p_corr_path, dpi=200)
    plt.close()
    logger.info(f"Saved {p_corr_path}")

    # 6. Property Type Distribution
    plt.figure(figsize=(8, 5))
    df['property_type'].value_counts().plot(kind='bar', color='#0ea5e9')
    plt.title("Property Types in Catalogue", fontsize=14, fontweight="bold")
    plt.xlabel("Property Type", fontsize=12)
    plt.ylabel("Count", fontsize=12)
    plt.xticks(rotation=0)
    p_type_path = plots_dir / "property_type_distribution.png"
    plt.savefig(p_type_path, dpi=200)
    plt.close()
    logger.info(f"Saved {p_type_path}")

    # Generate Data Dictionary & EDA Summary
    eda_summary = {
        "dataset_name": "Indian 7-City Real Estate Dataset (Kaggle)",
        "source_author": "rakkesharv",
        "total_records": int(len(df)),
        "features": list(df.columns),
        "cities": df['city'].value_counts().to_dict(),
        "property_types": df['property_type'].value_counts().to_dict(),
        "price_stats_lakhs": {
            "mean": round(float(df['price_lakhs'].mean()), 2),
            "median": round(float(df['price_lakhs'].median()), 2),
            "std": round(float(df['price_lakhs'].std()), 2),
            "min": round(float(df['price_lakhs'].min()), 2),
            "max": round(float(df['price_lakhs'].max()), 2),
            "p25": round(float(df['price_lakhs'].quantile(0.25)), 2),
            "p75": round(float(df['price_lakhs'].quantile(0.75)), 2)
        },
        "area_stats_sqft": {
            "mean": round(float(df['area_sqft'].mean()), 2),
            "median": round(float(df['area_sqft'].median()), 2),
            "min": round(float(df['area_sqft'].min()), 2),
            "max": round(float(df['area_sqft'].max()), 2)
        },
        "bhk_distribution": df['bhk'].value_counts().head(6).to_dict()
    }
    
    summary_path = metrics_dir / "eda_summary.json"
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(eda_summary, f, indent=2)
    logger.info(f"Saved EDA summary metrics to {summary_path}")

    data_dictionary = {
        "property_id": {"type": "string", "description": "Unique identifier for catalogue properties"},
        "title": {"type": "string", "description": "Listing title containing BHK, category, and locality"},
        "city": {"type": "string", "description": "Major Indian metropolitan city (Bangalore, Mumbai, Pune, etc.)"},
        "locality": {"type": "string", "description": "Neighborhood/Locality within the city"},
        "property_type": {"type": "string", "description": "Residential category (Apartment, Independent House, Villa)"},
        "bhk": {"type": "integer", "description": "Number of bedrooms (Bedroom-Hall-Kitchen)"},
        "bathrooms": {"type": "integer", "description": "Number of bathrooms in property"},
        "area_sqft": {"type": "float", "description": "Total built-up area in square feet"},
        "balcony": {"type": "integer", "description": "1 if balcony is present, 0 otherwise"},
        "price_inr": {"type": "float", "description": "Genuine target price in Indian National Rupees (₹)"},
        "price_lakhs": {"type": "float", "description": "Price scaled in Indian Lakhs (1 Lakh = ₹100,000)"},
        "price_per_sqft": {"type": "float", "description": "Price per square foot (strictly for analysis, NOT ML feature)"},
        "description": {"type": "string", "description": "Detailed listing description"}
    }
    dict_path = metrics_dir / "data_dictionary.json"
    with open(dict_path, 'w', encoding='utf-8') as f:
        json.dump(data_dictionary, f, indent=2)
    logger.info(f"Saved Data Dictionary to {dict_path}")

    return eda_summary

if __name__ == "__main__":
    run_eda()
