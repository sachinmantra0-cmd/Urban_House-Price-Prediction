import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calculator,
  Sparkles,
  MapPin,
  Home,
  Bed,
  Bath,
  Maximize2,
  Sliders,
  RefreshCw,
  Info,
  CheckCircle2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { api } from '../services/api';
import { PredictResponse, Property } from '../types';
import { formatPriceINR } from '../utils/formatters';
import { ShapChart } from '../components/ShapChart';
import { LoadingState } from '../components/LoadingState';

export const PredictPrice: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const prefillPropertyId = searchParams.get('propertyId');

  const [mode, setMode] = useState<'custom' | 'catalogue'>(prefillPropertyId ? 'catalogue' : 'custom');

  // Custom Form Fields
  const [city, setCity] = useState<string>('Bangalore');
  const [locality, setLocality] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('Apartment');
  const [bhk, setBhk] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [areaSqft, setAreaSqft] = useState<number>(1650);
  const [balcony, setBalcony] = useState<number>(1);

  // Selected Catalogue Property state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [catalogueSearchId, setCatalogueSearchId] = useState<string>(prefillPropertyId || '');

  // Prediction Output State
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cities = ["Bangalore", "Pune", "New Delhi", "Chennai", "Kolkata", "Mumbai", "Hyderabad"];
  const propertyTypes = ["Apartment", "Independent House", "Villa"];

  // If prefilled property ID is present in URL, load it automatically
  useEffect(() => {
    if (prefillPropertyId) {
      setCatalogueSearchId(prefillPropertyId);
      loadCatalogueProperty(prefillPropertyId);
    }
  }, [prefillPropertyId]);

  const loadCatalogueProperty = async (propId: string) => {
    try {
      setLoading(true);
      setError(null);
      const prop = await api.getPropertyById(propId.trim());
      setSelectedProperty(prop);
      // Pre-fill form values
      setCity(prop.city);
      setLocality(prop.locality);
      setPropertyType(prop.property_type);
      setBhk(prop.bhk);
      setBathrooms(prop.bathrooms);
      setAreaSqft(prop.area_sqft);
      setBalcony(prop.balcony);
      setMode('catalogue');

      // Auto-run prediction for selected property
      const pred = await api.predictProperty(propId.trim());
      setPrediction(pred);
    } catch (err: any) {
      setError(`Could not find property '${propId}'. Please check the ID.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await api.predictCustom({
        city,
        locality: locality.trim() || undefined,
        property_type: propertyType,
        bhk,
        bathrooms,
        area_sqft: areaSqft,
        balcony
      });
      setPrediction(res);
      // Smooth scroll to results
      setTimeout(() => {
        const el = document.getElementById('prediction-results-anchor');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError("Prediction failed. Please ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrediction(null);
    setSelectedProperty(null);
    setCity('Bangalore');
    setLocality('');
    setPropertyType('Apartment');
    setBhk(3);
    setBathrooms(3);
    setAreaSqft(1650);
    setBalcony(1);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase">
          <Calculator className="w-3.5 h-3.5" />
          <span>Machine Learning Valuation Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Estimate Indian House Prices
        </h1>
        <p className="text-sm text-slate-500">
          Trained on 14,400+ real Kaggle listings using Gradient Boosting & mathematical SHAP Explainability.
        </p>
      </div>

      {/* Mode Toggle Buttons */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-1 rounded-xl inline-flex space-x-1">
          <button
            onClick={() => setMode('custom')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'custom'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode B: Custom House Details
          </button>
          <button
            onClick={() => setMode('catalogue')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'catalogue'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode A: Select From Catalogue
          </button>
        </div>
      </div>

      {/* Catalogue Search Selector if Mode A */}
      {mode === 'catalogue' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <Home className="w-4 h-4 text-blue-600" />
            <span>Select a Verified Property from Catalogue</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={catalogueSearchId}
              onChange={(e) => setCatalogueSearchId(e.target.value)}
              placeholder="Enter Property ID (e.g. PROP_00001, PROP_00042)"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => catalogueSearchId && loadCatalogueProperty(catalogueSearchId)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold cursor-pointer shadow-xs"
            >
              Load Property Details
            </button>
          </div>

          {selectedProperty && (
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-xs font-bold text-blue-700">{selectedProperty.property_id} • {selectedProperty.city}</span>
                <h4 className="text-sm font-bold text-slate-900">{selectedProperty.title}</h4>
                <p className="text-xs text-slate-500">{selectedProperty.bhk} BHK • {selectedProperty.area_sqft} sq ft • Listed Price: {formatPriceINR(selectedProperty.listed_price_inr)}</p>
              </div>
              <button
                onClick={() => navigate(`/property/${selectedProperty.property_id}`)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View Full Page →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Prediction Input Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Property Dimensions & Features</h3>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Reset Form
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Indian City *</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-blue-600 pointer-events-none" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Locality */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Locality / Area Name</label>
            <input
              type="text"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder="e.g. Indiranagar, Bandra"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Property Type *</label>
            <div className="relative">
              <Home className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                required
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {propertyTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bedrooms BHK */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Bedrooms (BHK) *</label>
            <div className="relative">
              <Bed className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="number"
                min="1"
                max="10"
                value={bhk}
                onChange={(e) => setBhk(parseInt(e.target.value, 10) || 1)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Bathrooms *</label>
            <div className="relative">
              <Bath className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="number"
                min="1"
                max="10"
                value={bathrooms}
                onChange={(e) => setBathrooms(parseInt(e.target.value, 10) || 1)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Area in sq ft */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Built-up Area (sq ft) *</label>
            <div className="relative">
              <Maximize2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="number"
                min="150"
                max="12000"
                step="10"
                value={areaSqft}
                onChange={(e) => setAreaSqft(parseFloat(e.target.value) || 500)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

        </div>

        {/* Balcony Toggle */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 mb-2">Balcony Available?</label>
          <div className="inline-flex space-x-3">
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="balcony"
                checked={balcony === 1}
                onChange={() => setBalcony(1)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-700">Yes (Present)</span>
            </label>
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="balcony"
                checked={balcony === 0}
                onChange={() => setBalcony(0)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-700">No (None)</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center space-x-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Running Machine Learning..." : "Calculate ML Valuation & SHAP"}</span>
          </button>
        </div>

      </form>

      {/* Results Section */}
      {prediction && (
        <div id="prediction-results-anchor" className="space-y-8 animate-fade-in">
          
          {/* Main Price Valuation Card */}
          <div className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  ML-Predicted Valuation
                </span>
                <div className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-1">
                  {prediction.formatted_price}
                </div>
                <div className="text-sm text-blue-200 mt-1 font-medium">
                  ₹{Math.round(prediction.predicted_price_inr).toLocaleString('en-IN')} (₹{prediction.predicted_price_lakhs} Lakhs)
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <span className="block text-xs text-blue-200">Algorithm Used</span>
                <span className="inline-block px-3 py-1 rounded-lg bg-white/10 backdrop-blur border border-white/20 text-xs font-bold text-white">
                  {prediction.model_name}
                </span>
              </div>
            </div>

            {/* Input Summary Badges */}
            <div className="pt-4 border-t border-white/15 flex flex-wrap gap-2 text-xs font-semibold text-blue-100">
              <span className="px-3 py-1 rounded-md bg-white/10">{prediction.input_features.city}</span>
              <span className="px-3 py-1 rounded-md bg-white/10">{prediction.input_features.property_type}</span>
              <span className="px-3 py-1 rounded-md bg-white/10">{prediction.input_features.bhk} BHK</span>
              <span className="px-3 py-1 rounded-md bg-white/10">{prediction.input_features.bathrooms} Bath</span>
              <span className="px-3 py-1 rounded-md bg-white/10">{prediction.input_features.area_sqft} sq ft</span>
              <span className="px-3 py-1 rounded-md bg-white/10">{prediction.input_features.area_per_bhk} sq ft/room</span>
            </div>
          </div>

          {/* Genuine SHAP Waterfall Component */}
          {prediction.explanation && (
            <ShapChart
              explanation={prediction.explanation}
              predictedLakhs={prediction.predicted_price_lakhs}
              modelName={prediction.model_name}
            />
          )}

          {/* Limitations & Legal Academic Disclaimer */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
            <div className="flex items-center space-x-1.5 text-slate-700 font-bold">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Model Scope & Educational Notice</span>
            </div>
            <p className="leading-relaxed">
              {prediction.disclaimer}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
