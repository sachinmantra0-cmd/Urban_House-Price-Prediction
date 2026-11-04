export interface ImageItem {
  category: string;
  caption: string;
  url: string;
  fallback?: string;
}

export interface Property {
  property_id: string;
  title: string;
  city: string;
  locality: string;
  property_type: string;
  bhk: number;
  bathrooms: number;
  area_sqft: number;
  balcony: number;
  floor_number?: number;
  total_floors?: number;
  furnishing_status?: string;
  listed_price_inr: number;
  listed_price_lakhs: number;
  price_per_sqft?: number;
  description?: string;
  primary_image?: string;
  images: ImageItem[];
  amenities: string[];
  image_provenance: string;
  is_demo_property: boolean;
}

export interface PropertyListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: Property[];
}

export interface CityStat {
  city: string;
  count: number;
  avg_price_lakhs: number;
}

export interface PredictRequest {
  city: string;
  property_type: string;
  bhk: number;
  bathrooms: number;
  area_sqft: number;
  balcony: number;
  locality?: string;
}

export interface ShapContribution {
  feature: string;
  display_name: string;
  shap_lakhs: number;
  shap_inr: number;
  effect: 'positive' | 'negative';
}

export interface ShapExplanation {
  baseline_lakhs: number;
  baseline_inr: number;
  predicted_lakhs: number;
  predicted_inr: number;
  sum_shap_lakhs: number;
  is_additive: boolean;
  feature_contributions: ShapContribution[];
  positive_contributions: ShapContribution[];
  negative_contributions: ShapContribution[];
  top_drivers: ShapContribution[];
}

export interface PredictResponse {
  predicted_price_lakhs: number;
  predicted_price_inr: number;
  formatted_price: string;
  model_name: string;
  model_type: string;
  input_features: {
    city: string;
    property_type: string;
    bhk: number;
    bathrooms: number;
    area_sqft: number;
    balcony: number;
    area_per_bhk: number;
  };
  explanation?: ShapExplanation;
  disclaimer: string;
}

export interface ModelInfo {
  model_name: string;
  model_type: string;
  dataset: string;
  train_size: number;
  test_size: number;
  feature_count: number;
  test_r2: number;
  test_rmse_lakhs: number;
  test_mae_lakhs: number;
  trained_at: string;
}

export interface ModelMetrics {
  models: Record<string, {
    MAE: number;
    MSE: number;
    RMSE: number;
    R2: number;
    training_time_seconds: number;
  }>;
  best_model: string;
  best_metrics: {
    MAE: number;
    MSE: number;
    RMSE: number;
    R2: number;
    training_time_seconds: number;
  };
  test_samples: number;
  train_samples: number;
  total_samples: number;
  timestamp: string;
}

export interface AnalyticsOverview {
  dataset_name: string;
  total_catalogue_properties: number;
  supported_cities_count: number;
  cities: Record<string, number>;
  property_types: Record<string, number>;
  price_stats_lakhs: {
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
    p25: number;
    p75: number;
  };
  area_stats_sqft: {
    mean: number;
    median: number;
    min: number;
    max: number;
  };
  bhk_distribution: Record<string, number>;
}

export interface PriceDistributionBin {
  range_label: string;
  min_lakhs: number;
  max_lakhs: number;
  count: number;
}

export interface FeatureImportanceItem {
  feature: string;
  display_name: string;
  importance_lakhs: number;
  importance_inr: number;
}

export interface PredictionHistoryItem {
  id: number;
  property_id?: string;
  city: string;
  locality?: string;
  property_type: string;
  bhk: number;
  bathrooms: number;
  area_sqft: number;
  balcony: number;
  predicted_price_lakhs: number;
  predicted_price_inr: number;
  formatted_price: string;
  model_name: string;
  created_at: string;
}
