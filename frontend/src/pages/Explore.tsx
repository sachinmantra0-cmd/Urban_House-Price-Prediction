import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  Search,
  MapPin,
  Home,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';
import { api } from '../services/api';
import { Property, PropertyListResponse } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { LoadingState } from '../components/LoadingState';

interface ExploreProps {
  favouritesSet: Set<string>;
  comparisonsSet: Set<string>;
  onToggleFavourite: (id: string) => void;
  onToggleComparison: (id: string) => void;
}

export const Explore: React.FC<ExploreProps> = ({
  favouritesSet,
  comparisonsSet,
  onToggleFavourite,
  onToggleComparison,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [locality, setLocality] = useState(searchParams.get('locality') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('property_type') || '');
  const [bhk, setBhk] = useState(searchParams.get('bhk') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price_lakhs') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price_lakhs') || '');
  const [minArea, setMinArea] = useState(searchParams.get('min_area') || '');
  const [maxArea, setMaxArea] = useState(searchParams.get('max_area') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'relevance');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [data, setData] = useState<PropertyListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const cities = ["Bangalore", "Pune", "New Delhi", "Chennai", "Kolkata", "Mumbai", "Hyderabad"];
  const propertyTypes = ["Apartment", "Independent House", "Villa"];

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.getProperties({
        city: city || undefined,
        locality: locality || undefined,
        property_type: propertyType || undefined,
        bhk: bhk ? parseInt(bhk, 10) : undefined,
        min_price_lakhs: minPrice ? parseFloat(minPrice) : undefined,
        max_price_lakhs: maxPrice ? parseFloat(maxPrice) : undefined,
        min_area: minArea ? parseFloat(minArea) : undefined,
        max_area: maxArea ? parseFloat(maxArea) : undefined,
        sort_by: sortBy,
        page,
        page_size: 12
      });
      setData(res);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [city, locality, propertyType, bhk, minPrice, maxPrice, minArea, maxArea, sortBy, page]);

  const handleReset = () => {
    setCity('');
    setLocality('');
    setPropertyType('');
    setBhk('');
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');
    setSortBy('relevance');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Indian Houses</h1>
        <p className="text-sm text-slate-500 mt-1">
          Search over 14,400+ genuine residential properties by city, locality, budget, and BHK
        </p>
      </div>

      {/* Filter Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Search & Filter Parameters</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Indian Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Locality */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Locality</label>
            <input
              type="text"
              value={locality}
              onChange={(e) => { setLocality(e.target.value); setPage(1); }}
              placeholder="e.g. Koramangala, Baner"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Property Type</label>
            <select
              value={propertyType}
              onChange={(e) => { setPropertyType(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {propertyTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* BHK */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Bedrooms (BHK)</label>
            <select
              value={bhk}
              onChange={(e) => { setBhk(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
              <option value="5">5+ BHK</option>
            </select>
          </div>

          {/* Price Range (in Lakhs) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Min Price (₹ Lakhs)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
              placeholder="e.g. 30"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Max Price (₹ Lakhs)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
              placeholder="e.g. 250"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Area Range */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Min Area (sq ft)</label>
            <input
              type="number"
              value={minArea}
              onChange={(e) => { setMinArea(e.target.value); setPage(1); }}
              placeholder="e.g. 600"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Max Area (sq ft)</label>
            <input
              type="number"
              value={maxArea}
              onChange={(e) => { setMaxArea(e.target.value); setPage(1); }}
              placeholder="e.g. 3500"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>
      </div>

      {/* Results Header with Counts & Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-slate-700">
            {data ? (
              <>Showing {data.items.length} of <strong className="text-slate-900">{data.total.toLocaleString()}</strong> matching properties</>
            ) : (
              'Searching catalogue...'
            )}
          </span>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-500">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
          >
            <option value="relevance">Default Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="area_asc">Area: Smallest First</option>
            <option value="area_desc">Area: Largest First</option>
            <option value="bhk_desc">Bedrooms: Most BHK First</option>
          </select>
        </div>
      </div>

      {/* Property Cards Grid */}
      {loading ? (
        <LoadingState cardsCount={12} />
      ) : data && data.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.items.map((prop) => (
            <PropertyCard
              key={prop.property_id}
              property={prop}
              isFavourite={favouritesSet.has(prop.property_id)}
              isCompared={comparisonsSet.has(prop.property_id)}
              onToggleFavourite={onToggleFavourite}
              onToggleComparison={onToggleComparison}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No properties matched your criteria</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your budget or clearing locality filters to see more results from the 14,400+ properties catalogue.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-center space-x-3 pt-6 border-t border-slate-200">
          <button
            disabled={page <= 1}
            onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-semibold text-slate-700">
            Page {page} of {data.total_pages}
          </span>

          <button
            disabled={page >= data.total_pages}
            onClick={() => { setPage((p) => Math.min(data.total_pages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

    </div>
  );
};
