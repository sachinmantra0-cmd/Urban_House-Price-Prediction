import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  MapPin,
  Building,
  Sparkles,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { api } from '../services/api';
import {
  AnalyticsOverview,
  PriceDistributionBin,
  FeatureImportanceItem,
  CityStat
} from '../types';
import { LoadingState } from '../components/LoadingState';

export const Analytics: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [priceDist, setPriceDist] = useState<PriceDistributionBin[]>([]);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportanceItem[]>([]);
  const [cities, setCities] = useState<CityStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ovRes, distRes, impRes, cityRes] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getPriceDistribution(),
          api.getFeatureImportance(),
          api.getCities()
        ]);
        setOverview(ovRes);
        setPriceDist(distRes);
        setFeatureImportance(impRes);
        setCities(cityRes);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingState message="Aggregating market analytics & SHAP importance..." />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
        Analytics data currently unavailable.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Macro Real Estate Analytics</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Indian Housing Market Dataset Insights
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Empirical trends, price distributions, and global explainability drivers across 14,400+ properties
        </p>
      </div>

      {/* Key Metric Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="block text-xs font-medium text-slate-500">Total Analysed Properties</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {overview.total_catalogue_properties.toLocaleString()}
          </span>
          <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">7 Major Indian Metros</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="block text-xs font-medium text-slate-500">Median Listing Price</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            ₹{overview.price_stats_lakhs.median} Lakhs
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Mean: ₹{overview.price_stats_lakhs.mean}L</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="block text-xs font-medium text-slate-500">Median Living Area</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {overview.area_stats_sqft.median} sq ft
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Mean: {overview.area_stats_sqft.mean} sq ft</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="block text-xs font-medium text-slate-500">Interquartile Range (IQR)</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">
            ₹{overview.price_stats_lakhs.p25}L - ₹{overview.price_stats_lakhs.p75}L
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">25th to 75th percentile</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Price Distribution Histogram Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Price Bracket Distribution</h3>
          </div>
          <p className="text-xs text-slate-500">
            Number of properties classified by pricing tier (in Indian Lakhs & Crores)
          </p>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceDist} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range_label" angle={-20} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Properties`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {priceDist.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 1 || index === 2 ? '#2563eb' : '#60a5fa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global SHAP Feature Importance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Global SHAP Feature Importance</h3>
          </div>
          <p className="text-xs text-slate-500">
            Mean absolute SHAP value impact across the entire housing dataset (in ₹ Lakhs)
          </p>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={featureImportance.slice(0, 7)}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="display_name"
                  type="category"
                  tick={{ fontSize: 10 }}
                  width={140}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${val} Lakhs`, 'Mean Impact']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="importance_lakhs" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Average Price & Volume by City */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">City-Level Price & Inventory Overview</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Average listing price and representation across the 7 supported Indian tech hubs
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {cities.map((c) => (
            <div key={c.city} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500">{c.city}</span>
                <span className="text-lg font-extrabold text-slate-900 block mt-0.5">₹{c.avg_price_lakhs} Lakhs</span>
                <span className="text-[11px] text-slate-400">Average valuation</span>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold">
                  {c.count.toLocaleString()}
                </span>
                <span className="block text-[10px] text-slate-400 mt-1">listings</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Notice */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Academic & Analytical Notice:</strong> These statistics represent empirical distributions from the Kaggle Indian residential dataset. Real-estate markets experience localized sub-micro trends; this platform demonstrates academic data science modeling rather than live registered registry transaction data.
        </p>
      </div>

    </div>
  );
};
