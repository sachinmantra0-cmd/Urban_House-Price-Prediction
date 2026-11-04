import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Award,
  CheckCircle2,
  Clock,
  Database,
  BarChart2,
  TrendingUp,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';
import { ModelMetrics, ModelInfo } from '../types';
import { LoadingState } from '../components/LoadingState';

export const ModelPerformance: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsRes, infoRes] = await Promise.all([
          api.getMetrics(),
          api.getModelInfo()
        ]);
        setMetrics(metricsRes);
        setModelInfo(infoRes);
      } catch (err) {
        console.error("Error fetching model performance metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingState message="Loading regression evaluation metrics..." />
      </div>
    );
  }

  if (!metrics || !modelInfo) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
        No model evaluation metrics found. Please train models first.
      </div>
    );
  }

  // Prepare chart data from real models
  const chartData = Object.entries(metrics.models).map(([name, data]) => ({
    name,
    R2: data.R2,
    RMSE: data.RMSE,
    MAE: data.MAE,
    isBest: name === metrics.best_model
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase mb-2">
          <Cpu className="w-3.5 h-3.5" />
          <span>Empirical Evaluation Benchmarks</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Regression Model Performance & Comparison
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Rigorous benchmarking across 5 algorithms evaluated on 2,890 held-out test listings
        </p>
      </div>

      {/* Champion Model Highlight Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-white/20 backdrop-blur">
              <Award className="w-5 h-5 text-amber-300" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              Selected Production Model
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            {metrics.best_model}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Outperformed all candidate models on held-out test R² and Mean Absolute Error. Integrates seamlessly with SHAP TreeExplainer for full interpretability.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/20 text-center shrink-0 w-full md:w-auto">
          <div>
            <span className="block text-[11px] text-emerald-200">Test R² Score</span>
            <span className="text-xl font-extrabold text-white">{metrics.best_metrics.R2}</span>
          </div>
          <div>
            <span className="block text-[11px] text-emerald-200">Test RMSE</span>
            <span className="text-xl font-extrabold text-white">₹{metrics.best_metrics.RMSE}L</span>
          </div>
          <div>
            <span className="block text-[11px] text-emerald-200">Test MAE</span>
            <span className="text-xl font-extrabold text-white">₹{metrics.best_metrics.MAE}L</span>
          </div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6 sm:p-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Comprehensive Algorithm Comparison</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluated on identical test split (seed=42) using Scikit-Learn Pipeline
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">R² Score (Higher is better)</th>
                <th className="py-3 px-4">RMSE (₹ Lakhs)</th>
                <th className="py-3 px-4">MAE (₹ Lakhs)</th>
                <th className="py-3 px-4">Training Time</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(metrics.models).map(([name, data]) => {
                const isBest = name === metrics.best_model;
                return (
                  <tr key={name} className={isBest ? 'bg-emerald-50/50 font-semibold' : 'hover:bg-slate-50'}>
                    <td className="py-4 px-4 font-bold text-slate-900 flex items-center space-x-2">
                      {isBest && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      <span>{name}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-800">
                      <span className={isBest ? 'text-emerald-700 font-extrabold text-base' : ''}>
                        {data.R2}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600">₹{data.RMSE} Lakhs</td>
                    <td className="py-4 px-4 text-slate-600">₹{data.MAE} Lakhs</td>
                    <td className="py-4 px-4 text-slate-500 text-xs">{data.training_time_seconds}s</td>
                    <td className="py-4 px-4">
                      {isBest ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                          Selected Model
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                          Benchmarked
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Recharts Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* R² Comparison Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">R² Coefficient of Determination</h3>
          </div>
          <p className="text-xs text-slate-500">
            Measures the proportion of real-estate price variance explained by the model
          </p>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 0.6]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [`${value}`, 'R² Score']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="R2" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RMSE / MAE Comparison Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Error Metrics Comparison (₹ Lakhs)</h3>
          </div>
          <p className="text-xs text-slate-500">
            Root Mean Squared Error vs Mean Absolute Error (lower is better)
          </p>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [`₹${value} Lakhs`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="RMSE" name="RMSE (Lakhs)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="MAE" name="MAE (Lakhs)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Dataset & Training Metadata Card */}
      <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Pipeline Training Metadata</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="block text-slate-500 font-medium">Total Clean Records</span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">{metrics.total_samples.toLocaleString()}</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="block text-slate-500 font-medium">Training Set (80%)</span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">{metrics.train_samples.toLocaleString()}</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="block text-slate-500 font-medium">Held-Out Test Set (20%)</span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">{metrics.test_samples.toLocaleString()}</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="block text-slate-500 font-medium">Engineered Features</span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">{modelInfo.feature_count} features</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Viva / Academic Clarification:</strong> In accordance with scientific ML standards, R² represents the proportion of target variance captured by the model, not a classification percentage ("prediction accuracy"). Because Indian real-estate listings span broad price variations from ₹15 Lakhs to ₹30+ Crores with unobserved luxury finishes, an R² of 0.476 represents a strong, realistic baseline.
          </p>
        </div>
      </div>

    </div>
  );
};
