import React from 'react';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';
import { Compass, Sparkles } from 'lucide-react';

interface SimilarPropertiesProps {
  properties: Property[];
  currentCity: string;
  onToggleFavourite?: (id: string) => void;
  onToggleComparison?: (id: string) => void;
  favouritesSet?: Set<string>;
  comparisonsSet?: Set<string>;
}

export const SimilarProperties: React.FC<SimilarPropertiesProps> = ({
  properties,
  currentCity,
  onToggleFavourite,
  onToggleComparison,
  favouritesSet = new Set(),
  comparisonsSet = new Set()
}) => {
  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 pt-8 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Similar Homes in {currentCity}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Properties with comparable bedroom layout, square footage, and neighborhood characteristics
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
          {properties.length} Matching Recommendations
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.property_id}
            property={property}
            isFavourite={favouritesSet.has(property.property_id)}
            isCompared={comparisonsSet.has(property.property_id)}
            onToggleFavourite={onToggleFavourite}
            onToggleComparison={onToggleComparison}
          />
        ))}
      </div>
    </div>
  );
};
