import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Building2 } from 'lucide-react';
import { api } from '../services/api';
import { Property } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { LoadingState } from '../components/LoadingState';

interface FavouritesProps {
  onToggleFavourite: (id: string) => void;
  onToggleComparison: (id: string) => void;
  comparisonsSet: Set<string>;
}

export const Favourites: React.FC<FavouritesProps> = ({
  onToggleFavourite,
  onToggleComparison,
  comparisonsSet,
}) => {
  const [favourites, setFavourites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavourites = async () => {
    try {
      setLoading(true);
      const res = await api.getFavourites();
      setFavourites(res);
    } catch (err) {
      console.error("Error fetching favourites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  const handleRemove = async (id: string) => {
    await onToggleFavourite(id);
    setFavourites((prev) => prev.filter((p) => p.property_id !== id));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingState message="Loading your saved properties..." cardsCount={4} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase mb-2">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Saved Collections</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Your Favourite Properties
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {favourites.length} properties saved for valuation and comparison
        </p>
      </div>

      {favourites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favourites.map((prop) => (
            <PropertyCard
              key={prop.property_id}
              property={prop}
              isFavourite={true}
              isCompared={comparisonsSet.has(prop.property_id)}
              onToggleFavourite={handleRemove}
              onToggleComparison={onToggleComparison}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No saved favourites yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Click the heart icon on any property card while exploring the catalogue to save it here for quick access.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md"
          >
            <span>Explore Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
};
