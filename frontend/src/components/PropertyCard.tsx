import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Property } from '../types';
import { formatPriceINR, formatArea } from '../utils/formatters';

interface PropertyCardProps {
  property: Property;
  isFavourite?: boolean;
  isCompared?: boolean;
  onToggleFavourite?: (propertyId: string) => void;
  onToggleComparison?: (propertyId: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavourite = false,
  isCompared = false,
  onToggleFavourite,
  onToggleComparison,
}) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  // Fallback image handling
  const displayImage = imgError
    ? (property.images?.[0]?.fallback || '/api/static/property_image/exterior/sample_1.svg')
    : (property.primary_image || property.images?.[0]?.url || '/api/static/property_image/exterior/sample_1.svg');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col group">
      
      {/* Property Image & Overlays */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={displayImage}
          alt={property.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Property Type Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/90 backdrop-blur text-slate-800 shadow-xs">
            {property.property_type}
          </span>
          <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-slate-900/75 text-slate-200 backdrop-blur flex items-center">
            <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
            Illustrative Photo
          </span>
        </div>

        {/* Quick Actions (Favourite & Compare) */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5">
          {onToggleComparison && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleComparison(property.property_id);
              }}
              title={isCompared ? "Remove from comparison" : "Add to comparison"}
              className={`p-2 rounded-full backdrop-blur transition-all ${
                isCompared
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-blue-600'
              }`}
            >
              <Scale className="w-4 h-4" />
            </button>
          )}

          {onToggleFavourite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavourite(property.property_id);
              }}
              title={isFavourite ? "Remove from favourites" : "Save to favourites"}
              className={`p-2 rounded-full backdrop-blur transition-all ${
                isFavourite
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavourite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 left-3 text-white">
          <div className="text-xl font-extrabold tracking-tight">
            {formatPriceINR(property.listed_price_inr)}
          </div>
          {property.price_per_sqft && (
            <div className="text-[11px] text-slate-200 font-medium opacity-90">
              ₹{Math.round(property.price_per_sqft).toLocaleString('en-IN')}/sq ft
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center text-xs text-blue-600 font-semibold mb-1.5">
            <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span className="truncate">{property.locality}, {property.city}</span>
          </div>

          {/* Title */}
          <Link to={`/property/${property.property_id}`}>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3">
              {property.title}
            </h3>
          </Link>

          {/* Key Specifications Pill Row */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl text-slate-700 text-xs font-medium mb-4 border border-slate-100">
            <div className="flex items-center space-x-1.5">
              <Bed className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{property.bhk} BHK</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Bath className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{property.bathrooms} Bath</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Maximize2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{property.area_sqft} sq ft</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
          <Link
            to={`/property/${property.property_id}`}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 hover:bg-slate-50 transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => navigate(`/predict?propertyId=${property.property_id}`)}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-sm shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Predict Price</span>
          </button>
        </div>
      </div>

    </div>
  );
};
