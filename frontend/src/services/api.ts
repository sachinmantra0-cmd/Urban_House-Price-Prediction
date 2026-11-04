import axios from 'axios';
import {
  Property,
  PropertyListResponse,
  CityStat,
  PredictRequest,
  PredictResponse,
  ModelInfo,
  ModelMetrics,
  AnalyticsOverview,
  PriceDistributionBin,
  FeatureImportanceItem,
  PredictionHistoryItem
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health & Model
  getHealth: async () => {
    const res = await apiClient.get('/api/health');
    return res.data;
  },

  getModelInfo: async (): Promise<ModelInfo> => {
    const res = await apiClient.get('/api/model-info');
    return res.data;
  },

  getMetrics: async (): Promise<ModelMetrics> => {
    const res = await apiClient.get('/api/metrics');
    return res.data;
  },

  // Properties & Locations
  getProperties: async (params: {
    city?: string;
    locality?: string;
    property_type?: string;
    bhk?: number;
    min_price_lakhs?: number;
    max_price_lakhs?: number;
    min_area?: number;
    max_area?: number;
    sort_by?: string;
    page?: number;
    page_size?: number;
  }): Promise<PropertyListResponse> => {
    const res = await apiClient.get('/api/properties', { params });
    return res.data;
  },

  getPropertyById: async (id: string): Promise<Property> => {
    const res = await apiClient.get(`/api/properties/${id}`);
    return res.data;
  },

  getCities: async (): Promise<CityStat[]> => {
    const res = await apiClient.get('/api/locations/cities');
    return res.data;
  },

  getLocalities: async (city?: string): Promise<string[]> => {
    const res = await apiClient.get('/api/locations/localities', { params: { city } });
    return res.data;
  },

  getSimilarProperties: async (id: string, limit = 4): Promise<Property[]> => {
    const res = await apiClient.get(`/api/properties/${id}/similar`, { params: { limit } });
    return res.data;
  },

  // Predictions
  predictCustom: async (data: PredictRequest): Promise<PredictResponse> => {
    const res = await apiClient.post('/api/predict', data);
    return res.data;
  },

  predictProperty: async (propertyId: string): Promise<PredictResponse> => {
    const res = await apiClient.post(`/api/properties/${propertyId}/predict`);
    return res.data;
  },

  getPredictionHistory: async (limit = 20): Promise<PredictionHistoryItem[]> => {
    const res = await apiClient.get('/api/predictions/history', { params: { limit } });
    return res.data;
  },

  // Favourites
  getFavourites: async (): Promise<Property[]> => {
    const res = await apiClient.get('/api/favourites');
    return res.data;
  },

  addFavourite: async (propertyId: string): Promise<void> => {
    await apiClient.post('/api/favourites', { property_id: propertyId });
  },

  removeFavourite: async (propertyId: string): Promise<void> => {
    await apiClient.delete(`/api/favourites/${propertyId}`);
  },

  // Comparisons
  getComparisons: async (): Promise<Property[]> => {
    const res = await apiClient.get('/api/comparisons');
    return res.data;
  },

  addComparison: async (propertyId: string): Promise<void> => {
    await apiClient.post('/api/comparisons', { property_id: propertyId });
  },

  removeComparison: async (propertyId: string): Promise<void> => {
    await apiClient.delete(`/api/comparisons/${propertyId}`);
  },

  // Analytics
  getAnalyticsOverview: async (): Promise<AnalyticsOverview> => {
    const res = await apiClient.get('/api/analytics/overview');
    return res.data;
  },

  getPriceDistribution: async (): Promise<PriceDistributionBin[]> => {
    const res = await apiClient.get('/api/analytics/price-distribution');
    return res.data;
  },

  getFeatureImportance: async (): Promise<FeatureImportanceItem[]> => {
    const res = await apiClient.get('/api/analytics/feature-importance');
    return res.data;
  },
};
