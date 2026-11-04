import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Compass,
  CheckCircle,
  BarChart,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { Property, CityStat } from '../types';
import { SearchBar } from '../components/SearchBar';
import { PropertyCard } from '../components/PropertyCard';
import { LoadingState } from '../components/LoadingState';

interface HomeProps {
  favouritesSet: Set<string>;
  comparisonsSet: Set<string>;
  onToggleFavourite: (id: string) => void;
  onToggleComparison: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  favouritesSet,
  comparisonsSet,
  onToggleFavourite,
  onToggleComparison,
}) => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [cityStats, setCityStats] = useState<CityStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [propsRes, citiesRes] = await Promise.all([
          api.getProperties({ page: 1, page_size: 6 }),
          api.getCities()
        ]);
        setFeaturedProperties(propsRes.items);
        setCityStats(citiesRes);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 bg-gradient-to-b from-blue-50/70 via-slate-50 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Explainable AI Machine Learning Valuation</span>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Find Your Dream Home. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Understand Its True Value.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Explore Indian residential properties, estimate house prices using machine learning, and understand the exact statistical factors influencing each prediction with SHAP.
            </p>
          </div>

          {/* Embedded Search Bar */}
          <div className="pt-4">
            <SearchBar />
          </div>

          {/* Quick Stat Counter Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-600 font-medium">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 text-emerald-500 mr-1.5" />
              14,400+ Verified Kaggle Records
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 text-emerald-500 mr-1.5" />
              7 Major Indian Tech Hubs
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 text-emerald-500 mr-1.5" />
              Mathematical SHAP Attribution
            </span>
          </div>

        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Actual Market Data</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Featured Residential Properties</h2>
            <p className="text-sm text-slate-500 mt-1">Discover real properties with full specifications and instant AI valuation</p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center space-x-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <span>Browse All Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingState cardsCount={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((prop) => (
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
        )}
      </section>

      {/* Browse By City Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Geographic Coverage</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Explore Properties by Indian City</h2>
          <p className="text-sm text-slate-500 mt-1">
            Genuine dataset distribution across 7 primary residential real-estate markets
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {cityStats.map((item) => (
            <div
              key={item.city}
              onClick={() => navigate(`/explore?city=${item.city}`)}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center mx-auto mb-2 transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{item.city}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{item.count.toLocaleString()} listings</p>
              <p className="text-[11px] font-semibold text-blue-600 mt-1">Avg: ₹{item.avg_price_lakhs}L</p>
            </div>
          ))}
        </div>
      </section>

      {/* How Machine Learning Prediction Works Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Scientific Pipeline</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How HouseEstiMate Predicts Property Prices</h2>
            <p className="text-sm text-slate-400">
              Unlike static mock calculators, our platform utilizes an authentic end-to-end Machine Learning pipeline with mathematical Explainable AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-white">Genuine Dataset Cleaning</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Raw Kaggle dataset with 14,500+ records processed with strict regex price parsers (Lakhs & Crores), outlier filtration, and canonical schema mapping.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-white">Non-Leaking Features</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                City one-hot encoding, property type, room-density transformations (`area_per_bhk`), and StandardScaler fitted strictly on the 80% training split.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-white">Gradient Boosting Regressor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compared against Linear Regression, Decision Trees, Random Forests, and XGBoost. Evaluated on 2,890 held-out test listings (R² = 0.476).
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-400 flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h3 className="text-base font-bold text-white">SHAP Waterfall Transparency</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cooperative game theory computes exact positive and negative feature contributions. Baseline + Σ SHAP mathematically equals the predicted price.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-3xl p-10 sm:p-14 text-white shadow-2xl space-y-6">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Ready to estimate any Indian residential property?
        </h2>
        <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
          Enter custom property dimensions or select any verified catalogue listing to view its machine learning valuation and SHAP explanation in seconds.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/predict"
            className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            Predict House Price
          </Link>
          <Link
            to="/explore"
            className="px-6 py-3 bg-blue-800/60 hover:bg-blue-800 text-white font-bold text-sm rounded-xl border border-blue-400/40 transition-colors"
          >
            Explore Catalogue
          </Link>
        </div>
      </section>

    </div>
  );
};
