import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Building,
  Heart,
  Scale,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
  Share2,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { Property, PredictResponse } from '../types';
import { formatPriceINR } from '../utils/formatters';
import { PropertyGallery } from '../components/PropertyGallery';
import { ShapChart } from '../components/ShapChart';
import { SimilarProperties } from '../components/SimilarProperties';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

interface PropertyDetailsProps {
  favouritesSet: Set<string>;
  comparisonsSet: Set<string>;
  onToggleFavourite: (id: string) => void;
  onToggleComparison: (id: string) => void;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  favouritesSet,
  comparisonsSet,
  onToggleFavourite,
  onToggleComparison,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Prediction state for this property
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [predicting, setPredicting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setPrediction(null);
        const [propRes, simRes] = await Promise.all([
          api.getPropertyById(id),
          api.getSimilarProperties(id, 4)
        ]);
        setProperty(propRes);
        setSimilarProperties(simRes);
      } catch (err: any) {
        console.error("Error fetching property details:", err);
        setError("Property not found or backend service unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handlePredictPrice = async () => {
    if (!id) return;
    try {
      setPredicting(true);
      const res = await api.predictProperty(id);
      setPrediction(res);
      // Smooth scroll to prediction result
      setTimeout(() => {
        const el = document.getElementById('prediction-result-panel');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error("Prediction error:", err);
    } finally {
      setPredicting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingState message="Loading property specifications & images..." />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ErrorState
          title="Property Not Found"
          message={error || "Could not retrieve property record."}
          onRetry={() => navigate('/explore')}
        />
      </div>
    );
  }

  const isFavourite = favouritesSet.has(property.property_id);
  const isCompared = comparisonsSet.has(property.property_id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Top Breadcrumb & Action Row */}
      <div className="flex items-center justify-between">
        <Link
          to="/explore"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Houses</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium flex items-center space-x-1.5 cursor-pointer"
            title="Share property link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={() => onToggleComparison(property.property_id)}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center space-x-1.5 cursor-pointer transition-colors ${
              isCompared
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">{isCompared ? 'Comparing' : 'Compare'}</span>
          </button>

          <button
            onClick={() => onToggleFavourite(property.property_id)}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center space-x-1.5 cursor-pointer transition-colors ${
              isFavourite
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavourite ? 'fill-current text-rose-600' : ''}`} />
            <span className="hidden sm:inline">{isFavourite ? 'Saved' : 'Favourite'}</span>
          </button>
        </div>
      </div>

      {/* Property Title & Price Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {property.property_type}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <div className="flex items-center text-xs font-semibold text-blue-600">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              <span>{property.locality}, {property.city}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {property.title}
          </h1>
          <p className="text-xs text-slate-500">
            Property ID: <strong className="font-mono text-slate-700">{property.property_id}</strong> • Listed in Kaggle Indian 7-City Real Estate Dataset
          </p>
        </div>

        {/* Listed Price & Predict Price Trigger */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 text-left md:text-right space-y-3 shrink-0">
          <div>
            <span className="block text-xs font-medium text-slate-500">Official Listed Price</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {formatPriceINR(property.listed_price_inr)}
            </span>
            {property.price_per_sqft && (
              <span className="block text-xs text-slate-500 mt-0.5">
                ₹{Math.round(property.price_per_sqft).toLocaleString('en-IN')} per sq ft
              </span>
            )}
          </div>

          <button
            onClick={handlePredictPrice}
            disabled={predicting}
            className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" />
            <span>{predicting ? "Computing ML Valuation..." : "PREDICT PRICE (ML & SHAP)"}</span>
          </button>
        </div>
      </div>

      {/* Property Interior & Exterior Gallery */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Property Image Gallery & Floor Plans</h2>
        <PropertyGallery images={property.images} title={property.title} />
      </section>

      {/* Specifications & Overview Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        
        {/* Left Column: Specifications & Amenities */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Key Specifications Matrix */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Property Specifications</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="block text-xs font-medium text-slate-500">Bedrooms (BHK)</span>
                <span className="text-base font-bold text-slate-800 flex items-center mt-1">
                  <Bed className="w-4 h-4 mr-1 text-slate-400" />
                  {property.bhk} BHK
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="block text-xs font-medium text-slate-500">Bathrooms</span>
                <span className="text-base font-bold text-slate-800 flex items-center mt-1">
                  <Bath className="w-4 h-4 mr-1 text-slate-400" />
                  {property.bathrooms} Bath
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="block text-xs font-medium text-slate-500">Super Built-up Area</span>
                <span className="text-base font-bold text-slate-800 flex items-center mt-1">
                  <Maximize2 className="w-4 h-4 mr-1 text-slate-400" />
                  {property.area_sqft} sq ft
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="block text-xs font-medium text-slate-500">Floor Level</span>
                <span className="text-base font-bold text-slate-800 flex items-center mt-1">
                  <Building className="w-4 h-4 mr-1 text-slate-400" />
                  {property.floor_number ? `Floor ${property.floor_number}` : 'Ground'} of {property.total_floors || 4}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="block text-xs font-medium text-slate-500">Furnishing</span>
                <span className="text-sm font-semibold text-slate-800 mt-0.5 block">{property.furnishing_status}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="block text-xs font-medium text-slate-500">Balcony</span>
                <span className="text-sm font-semibold text-slate-800 mt-0.5 block">{property.balcony ? 'Yes (Present)' : 'None'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="block text-xs font-medium text-slate-500">City / Market</span>
                <span className="text-sm font-semibold text-slate-800 mt-0.5 block">{property.city}</span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Verified Amenities & Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs font-semibold text-slate-700 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900">Listing Description</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          )}

        </div>

        {/* Right Column: Instant Machine Learning Valuation Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold">Machine Learning Price Estimate</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Run our Gradient Boosting regressor on this property's exact features ({property.city}, {property.bhk} BHK, {property.area_sqft} sq ft, {property.property_type}).
            </p>

            <button
              onClick={handlePredictPrice}
              disabled={predicting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {predicting ? "Running TreeExplainer..." : "Run ML Valuation Now"}
            </button>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>• Verified algorithm: Gradient Boosting (R² = 0.476)</p>
              <p>• Mathematical SHAP additivity guaranteed</p>
              <p>• No target leakage; genuine features only</p>
            </div>
          </div>

          {/* Provenance Disclosure Box */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Image & Listing Provenance</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              This property's metadata (location, bedrooms, area, listed price) is from the Kaggle 7-City Indian Real Estate dataset. Architectural photographs and interior room images are curated illustrative demo assets.
            </p>
          </div>
        </div>

      </section>

      {/* ML Prediction & SHAP Waterfall Result Panel (Rendered when user triggers prediction) */}
      {prediction && (
        <section id="prediction-result-panel" className="space-y-6 pt-6 border-t border-slate-200 animate-fade-in">
          <div className="bg-gradient-to-tr from-blue-50 via-indigo-50 to-white p-6 sm:p-8 rounded-3xl border border-blue-200 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Machine Learning Output</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Valuation Result: <span className="text-blue-600">{prediction.formatted_price}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Exact INR: ₹{Math.round(prediction.predicted_price_inr).toLocaleString('en-IN')} (₹{prediction.predicted_price_lakhs} Lakhs)
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-600">
                <span className="block font-semibold">Trained Algorithm:</span>
                <span className="inline-block px-2.5 py-1 rounded-md bg-white border border-slate-200 font-bold text-slate-800 mt-1">
                  {prediction.model_name}
                </span>
              </div>
            </div>

            {/* Comparison against Listed Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-blue-100">
              <div>
                <span className="block text-xs font-medium text-slate-500">Original Listed Price</span>
                <span className="text-lg font-extrabold text-slate-800">
                  {formatPriceINR(property.listed_price_inr)}
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500">ML Estimated Valuation</span>
                <span className="text-lg font-extrabold text-blue-600">
                  {prediction.formatted_price}
                </span>
              </div>
            </div>

            {/* SHAP Waterfall Component */}
            {prediction.explanation && (
              <ShapChart
                explanation={prediction.explanation}
                predictedLakhs={prediction.predicted_price_lakhs}
                modelName={prediction.model_name}
              />
            )}

            {/* Disclaimer */}
            <p className="text-[11px] text-slate-500 italic">
              {prediction.disclaimer}
            </p>
          </div>
        </section>
      )}

      {/* Similar Properties Section */}
      <SimilarProperties
        properties={similarProperties}
        currentCity={property.city}
        favouritesSet={favouritesSet}
        comparisonsSet={comparisonsSet}
        onToggleFavourite={onToggleFavourite}
        onToggleComparison={onToggleComparison}
      />

    </div>
  );
};
