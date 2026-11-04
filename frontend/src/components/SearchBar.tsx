import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, Bed, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  initialCity?: string;
  initialLocality?: string;
  initialType?: string;
  initialBhk?: number;
  compact?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialCity = '',
  initialLocality = '',
  initialType = '',
  initialBhk,
  compact = false
}) => {
  const navigate = useNavigate();
  const [city, setCity] = useState(initialCity);
  const [locality, setLocality] = useState(initialLocality);
  const [propertyType, setPropertyType] = useState(initialType);
  const [bhk, setBhk] = useState<string>(initialBhk ? String(initialBhk) : '');

  const cities = ["Bangalore", "Pune", "New Delhi", "Chennai", "Kolkata", "Mumbai", "Hyderabad"];
  const propertyTypes = ["Apartment", "Independent House", "Villa"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city && city !== 'all') params.set('city', city);
    if (locality.trim()) params.set('locality', locality.trim());
    if (propertyType && propertyType !== 'all') params.set('property_type', propertyType);
    if (bhk && bhk !== 'all') params.set('bhk', bhk);

    navigate(`/explore?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-3 sm:p-4 transition-all ${
        compact ? 'max-w-4xl mx-auto' : 'max-w-5xl mx-auto'
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
        
        {/* City Selection */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Select City</label>
          <div className="relative flex items-center">
            <MapPin className="absolute left-3 w-4 h-4 text-blue-600 pointer-events-none" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">All Indian Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Locality Search */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Locality / Neighborhood</label>
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder="e.g. Whitefield, Koramangala"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Property Type</label>
          <div className="relative flex items-center">
            <Home className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">All Categories</option>
              {propertyTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* BHK & Submit */}
        <div className="flex items-end space-x-2">
          <div className="relative flex-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Bedrooms (BHK)</label>
            <div className="relative flex items-center">
              <Bed className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={bhk}
                onChange={(e) => setBhk(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">Any BHK</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer h-[42px]"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

      </div>
    </form>
  );
};
