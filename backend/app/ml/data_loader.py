import os
import re
from pathlib import Path
from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np

from backend.app.utils.logger import logger
from backend.app.utils.config import settings

# Canonical Schema Definition
CANONICAL_COLUMNS = [
    "property_id",
    "title",
    "city",
    "locality",
    "property_type",
    "bhk",
    "bathrooms",
    "area_sqft",
    "balcony",
    "price_inr",
    "price_lakhs",
    "price_per_sqft",
    "description"
]

# Configurable Column Mapping Layer
COLUMN_MAPPINGS = {
    "Real Estate Data V21.csv": {
        "title": "Property Title",
        "raw_price": "Price",
        "location": "Location",
        "total_area": "Total_Area",
        "price_per_sqft": "Price_per_SQFT",
        "description": "Description",
        "baths": "Baths",
        "balcony": "Balcony"
    }
}

VALID_CITIES = {
    "bangalore": "Bangalore",
    "bengaluru": "Bangalore",
    "pune": "Pune",
    "new delhi": "New Delhi",
    "delhi": "New Delhi",
    "chennai": "Chennai",
    "kolkata": "Kolkata",
    "mumbai": "Mumbai",
    "hyderabad": "Hyderabad",
    "thane": "Mumbai"  # Map Thane to Mumbai MMR
}

def parse_price(price_str: Any) -> Tuple[float, float]:
    """
    Parses Indian price strings (e.g., '₹1.99 Cr', '₹48.0 L', 'Rs 85 Lakh')
    Returns:
        (price_inr, price_lakhs) or (np.nan, np.nan) if invalid.
    """
    if pd.isna(price_str):
        return np.nan, np.nan
    s = str(price_str).replace('₹', '').replace('Rs', '').replace(',', '').strip()
    match = re.search(r'([\d\.]+)\s*(Cr|crore|L|lakh|k)?', s, re.IGNORECASE)
    if not match:
        return np.nan, np.nan
    
    val = float(match.group(1))
    unit = match.group(2)
    
    if unit:
        unit = unit.lower()
        if 'cr' in unit:
            price_lakhs = val * 100.0
            price_inr = val * 10_000_000.0
            return price_inr, price_lakhs
        elif 'l' in unit:
            price_lakhs = val
            price_inr = val * 100_000.0
            return price_inr, price_lakhs
        elif 'k' in unit:
            price_lakhs = val / 100.0
            price_inr = val * 1_000.0
            return price_inr, price_lakhs
    
    # Ambiguous unit-less prices (e.g. ₹2.0 with no unit)
    return np.nan, np.nan

def parse_location(loc_str: Any) -> Tuple[str, str]:
    """
    Extracts city and locality from location strings.
    E.g. 'Kanathur Reddikuppam, Chennai' -> ('Chennai', 'Kanathur Reddikuppam')
    """
    if pd.isna(loc_str):
        return "Other", "Unknown"
    parts = [p.strip() for p in str(loc_str).split(',') if p.strip()]
    if not parts:
        return "Other", "Unknown"
    
    raw_city = parts[-1].lower()
    city = VALID_CITIES.get(raw_city, None)
    if not city:
        # Check if any valid city appears in parts
        for part in reversed(parts):
            p_clean = part.lower()
            for key, val in VALID_CITIES.items():
                if key in p_clean:
                    city = val
                    break
            if city:
                break
    
    if not city:
        city = parts[-1].title()
        
    locality = parts[0] if len(parts) > 1 else parts[0]
    return city, locality

def parse_property_type(title_str: Any) -> str:
    """
    Identifies property category from property title.
    """
    t = str(title_str).lower()
    if 'flat' in t or 'apartment' in t:
        return 'Apartment'
    elif 'independent house' in t or 'house' in t:
        return 'Independent House'
    elif 'villa' in t:
        return 'Villa'
    elif 'builder floor' in t or 'floor' in t:
        return 'Builder Floor'
    elif 'penthouse' in t:
        return 'Penthouse'
    elif 'studio' in t:
        return 'Studio'
    return 'Apartment'

def parse_bhk(title_str: Any, desc_str: Any) -> int:
    """
    Extracts BHK / bedroom count from title or description.
    """
    title = str(title_str)
    # Match standard BHK
    m = re.search(r'(\d+)\s*BHK', title, re.IGNORECASE)
    if m:
        return int(m.group(1))
    if '1 RK' in title.upper() or '1RK' in title.upper():
        return 1
    m_rk = re.search(r'(\d+)\s*RK', title, re.IGNORECASE)
    if m_rk:
        return int(m_rk.group(1))
    
    # Fallback to description
    desc = str(desc_str)
    m_desc = re.search(r'(\d+)\s*(?:bedroom|bhk)', desc, re.IGNORECASE)
    if m_desc:
        return int(m_desc.group(1))
    
    return 2  # standard default for Indian residential market

def load_and_clean_data(raw_csv_path: Path = None, save_processed: bool = True) -> pd.DataFrame:
    """
    Loads raw Kaggle dataset, applies schema mappings, cleans data,
    filters duplicates/outliers, and returns canonical DataFrame.
    """
    path = raw_csv_path or settings.RAW_DATA_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Raw dataset not found at {path}. Please ensure 'Real Estate Data V21.csv' is in backend/data/raw/."
        )
    
    logger.info(f"Loading raw data from {path}...")
    df = pd.read_csv(path, encoding='utf-8')
    initial_count = len(df)
    logger.info(f"Loaded {initial_count} raw rows with columns: {list(df.columns)}")
    
    # Drop exact duplicates
    df = df.drop_duplicates()
    logger.info(f"Dropped {initial_count - len(df)} duplicate records.")
    
    # Process price
    price_tuples = df['Price'].apply(parse_price)
    df['price_inr'] = [pt[0] for pt in price_tuples]
    df['price_lakhs'] = [pt[1] for pt in price_tuples]
    
    # Drop records with invalid or missing prices
    valid_price_mask = df['price_inr'].notna() & (df['price_inr'] > 0)
    logger.info(f"Dropping {(~valid_price_mask).sum()} records with invalid price format.")
    df = df[valid_price_mask].copy()
    
    # Parse Location
    loc_tuples = df['Location'].apply(parse_location)
    df['city'] = [lt[0] for lt in loc_tuples]
    df['locality'] = [lt[1] for lt in loc_tuples]
    
    # Filter only supported major 7 cities
    supported_cities = ["Bangalore", "Pune", "New Delhi", "Chennai", "Kolkata", "Mumbai", "Hyderabad"]
    df = df[df['city'].isin(supported_cities)].copy()
    
    # Parse Property Type
    df['property_type'] = df['Property Title'].apply(parse_property_type)
    
    # Parse BHK
    df['bhk'] = [parse_bhk(t, d) for t, d in zip(df['Property Title'], df['Description'])]
    
    # Bathrooms from Baths
    df['bathrooms'] = pd.to_numeric(df['Baths'], errors='coerce').fillna(2).astype(int)
    
    # Balcony from Balcony column
    df['balcony'] = df['Balcony'].apply(lambda x: 1 if str(x).strip().lower() in ['yes', '1', 'true'] else 0)
    
    # Area in sqft
    df['area_sqft'] = pd.to_numeric(df['Total_Area'], errors='coerce')
    
    # Price per SQFT from raw data or computed (for analysis only, NEVER for ML feature input)
    df['price_per_sqft'] = pd.to_numeric(df['Price_per_SQFT'], errors='coerce').fillna(df['price_inr'] / df['area_sqft'])
    
    # Canonical Title and Description
    df['title'] = df['Property Title'].astype(str)
    df['description'] = df['Description'].astype(str)
    
    # Outlier removal: Realistic physical boundaries
    # Area: between 150 sqft and 12,000 sqft
    # Price: between ₹5 Lakhs and ₹40 Crores (4000 Lakhs)
    # BHK: between 1 and 10
    # Bathrooms: between 1 and 10
    clean_mask = (
        (df['area_sqft'] >= 150) & (df['area_sqft'] <= 12000) &
        (df['price_lakhs'] >= 5.0) & (df['price_lakhs'] <= 4000.0) &
        (df['bhk'] >= 1) & (df['bhk'] <= 10) &
        (df['bathrooms'] >= 1) & (df['bathrooms'] <= 10)
    )
    logger.info(f"Filtering {len(df) - clean_mask.sum()} outlier records.")
    df = df[clean_mask].copy().reset_index(drop=True)
    
    # Generate structured property_id
    df['property_id'] = [f"PROP_{i+1:05d}" for i in range(len(df))]
    
    # Select canonical columns
    canonical_df = df[CANONICAL_COLUMNS].copy()
    logger.info(f"Cleaned dataset ready: {len(canonical_df)} records across {canonical_df['city'].nunique()} cities.")
    
    if save_processed:
        os.makedirs(settings.PROCESSED_DATA_PATH.parent, exist_ok=True)
        canonical_df.to_csv(settings.PROCESSED_DATA_PATH, index=False, encoding='utf-8')
        logger.info(f"Saved processed dataset to {settings.PROCESSED_DATA_PATH}")
        
    return canonical_df

if __name__ == "__main__":
    df = load_and_clean_data()
    print("Sample processed data:")
    print(df.head(3))
