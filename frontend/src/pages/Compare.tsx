import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  Trash2,
  Sparkles,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Building,
  CheckCircle,
  ArrowRight,
  PlusCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Property, PredictResponse } from '../types';
import { formatPriceINR } from '../utils/formatters';
import { LoadingState } from '../components/LoadingState';

interface CompareProps {
  onRemoveComparison: (id: string) => void;
}

export const Compare: React.FC<CompareProps> = ({ onRemoveComparison }) => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [predictions, setPredictions] = useState<Record<string, PredictResponse>>({});
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState<Record<string, boolean>>({});

  const fetchComparisons = async () => {
    try {
      setLoading(true);
      const res = await api.getComparisons();
      setProperties(res);

      // Auto-fetch ML predictions for each compared property
      const predsMap: Record<string, PredictResponse> = {};
      for (const prop of res) {
        try {
          const pred = await api.predictProperty(prop.property_id);
          predsMap[prop.property_id] = pred;
        } catch (e) {
          console.error(`Failed to predict for ${prop.property_id}:`, e);
        }
      }
      setPredictions(predsMap);
    } catch (err) {
      console.error("Error fetching comparison properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisons();
  }, []);

  const handleRemove = async (id: string) => {
    await onRemoveComparison(id);
    setProperties((prev) => prev.filter((p) => p.property_id !== id));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingState message="Loading comparison matrix and ML predictions..." cardsCount={3} />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">No properties selected for comparison</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          You can select up to 4 houses while browsing the catalogue to compare their prices, specifications, and ML valuations side-by-side.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md"
        >
          <span>Explore Properties</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Side-by-Side Analysis</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Property Comparison Matrix
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Comparing {properties.length} of max 4 properties with verified specifications and ML valuations
          </p>
        </div>

        {properties.length < 4 && (
          <Link
            to="/explore"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add More Properties</span>
          </Link>
        )}
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider w-44 rounded-l-xl">
                  Property Feature
                </th>
                {properties.map((prop) => (
                  <th key={prop.property_id} className="p-4 bg-slate-50 min-w-[240px] align-top">
                    <div className="space-y-3">
                      <div className="relative h-32 rounded-xl overflow-hidden bg-slate-100">
                        <img
                          src={prop.primary_image || prop.images[0]?.url || '/api/static/property_image/exterior/sample_1.svg'}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemove(prop.property_id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md cursor-pointer transition-colors"
                          title="Remove property"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase">{prop.property_type}</span>
                        <Link to={`/property/${prop.property_id}`}>
                          <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 line-clamp-2 mt-0.5">
                            {prop.title}
                          </h4>
                        </Link>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              
              {/* Location */}
              <tr>
                <td className="p-4 font-bold text-slate-600 text-xs uppercase bg-slate-50/50">Location</td>
                {properties.map((p) => (
                  <td key={p.property_id} className="p-4 font-semibold text-slate-800">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{p.locality}, {p.city}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Listed Price */}
              <tr className="bg-blue-50/20">
                <td className="p-4 font-bold text-slate-600 text-xs uppercase bg-slate-50/50">Listed Price</td>
                {properties.map((p) => (
                  <td key={p.property_id} className="p-4 text-base font-extrabold text-slate-900">
                    {formatPriceINR(p.listed_price_inr)}
                  </td>
                ))}
              </tr>

              {/* ML Predicted Price */}
              <tr className="bg-indigo-50/30">
                <td className="p-4 font-bold text-indigo-900 text-xs uppercase bg-indigo-50/60 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>ML Valuation</span>
                </td>
                {properties.map((p) => {
                  const pred = predictions[p.property_id];
                  return (
                    <td key={p.property_id} className="p-4">
                      {pred ? (
                        <div>
                          <span className="text-base font-extrabold text-indigo-600 block">
                            {pred.formatted_price}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            By {pred.model_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Calculating...</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Bedrooms BHK */}
              <tr>
                <td className="p-4 font-bold text-slate-600 text-xs uppercase bg-slate-50/50">Bedrooms (BHK)</td>
                {properties.map((p) => (
                  <td key={p.property_id} className="p-4 font-semibold text-slate-800">
                    {p.bhk} BHK
                  </td>
                ))}
              </tr>

              {/* Bathrooms */}
              <tr>
                <td className="p-4 font-bold text-slate-600 text-xs uppercase bg-slate-50/50">Bathrooms</td>
                {properties.map((p) => (
                  <td key={p.property_id} className="p-4 font-semibold text-slate-800">
                    {p.bathrooms} Bathrooms
                  </td>
                ))}
              </tr>

              {/* Area */}
              <tr>
                <td className="p-4 font-bold text-slate-600 text-xs uppercase bg-slate-50/50">Total Area</td>
                {properties.map((p) => (
                  <td key={p.property_id} className="p-4 font-semibold text-slate-800">
                    {p.area_sqft} sq ft
                  </td>
                ))}
              </tr>

              {/* Rate per sq ft */}
              <tr>
                <td className="p-4 font-bold text-slate-600 text-xs uppercase bg-slate-50/50">Rate / Sq Ft</td>
                {properties.map((p) => (
                  <td key={p.property_id} className="p-4 font-semibold text-slate-700 text-xs">
                    ₹{Math.round(p.price_per_sqft || (p.listed_price_inr / p.area_sqft)).toLocaleString('en-IN')} / sq ft
                  </td>
                ))}
              </tr>

              {/* Furnishing */}
              <tr>
                <td className="p-4 font-bold text-slate-600 text-xs uppercase bg-slate-50/50">Furnishing</td>
                {properties.map((p) => (
                  <td key={p.property_id} className="p-4 text-slate-700">
                    {p.furnishing_status}
                  </td>
                ))}
              </tr>

              {/* Balcony */}
              <tr>
                <td className="p-4 font-bold text-slate-600 text-xs uppercase bg-slate-50/50">Balcony</td>
                {properties.map((p) => (
                  <td key={p.property_id} className="p-4 text-slate-700">
                    {p.balcony ? 'Yes (Present)' : 'None'}
                  </td>
                ))}
              </tr>

              {/* Actions */}
              <tr>
                <td className="p-4 font-bold text-slate-600 text-xs uppercase bg-slate-50/50">Actions</td>
                {properties.map((p) => (
                  <td key={p.property_id} className="p-4">
                    <button
                      onClick={() => navigate(`/property/${p.property_id}`)}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
