import React from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ShapExplanation } from '../types';
import { formatPriceINR, formatPriceLakhs } from '../utils/formatters';

interface ShapChartProps {
  explanation: ShapExplanation;
  predictedLakhs: number;
  modelName: string;
}

export const ShapChart: React.FC<ShapChartProps> = ({
  explanation,
  predictedLakhs,
  modelName
}) => {
  const {
    baseline_lakhs,
    baseline_inr,
    sum_shap_lakhs,
    is_additive,
    feature_contributions,
    positive_contributions,
    negative_contributions
  } = explanation;

  // Maximum SHAP value for proportional bar scaling
  const maxAbsShap = Math.max(...feature_contributions.map((c) => Math.abs(c.shap_lakhs)), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Explainable AI (SHAP Waterfall)</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Understanding exact statistical feature contributions derived by {modelName}
          </p>
        </div>

        {/* Additivity Badge */}
        <div className="flex items-center space-x-2">
          {is_additive ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Verified SHAP Additivity
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Numerical Approximation
            </span>
          )}
        </div>
      </div>

      {/* Baseline to Prediction Progression */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
        <div>
          <span className="block text-xs font-medium text-slate-500">Market Baseline (Expected Value)</span>
          <span className="text-lg font-extrabold text-slate-800">
            {formatPriceLakhs(baseline_lakhs)}
          </span>
          <span className="block text-[11px] text-slate-400">Average dataset expectation</span>
        </div>

        <div className="sm:border-x border-slate-200 sm:px-4">
          <span className="block text-xs font-medium text-slate-500">Net Feature Impact (Σ SHAP)</span>
          <span className={`text-lg font-extrabold ${sum_shap_lakhs >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {sum_shap_lakhs >= 0 ? `+${sum_shap_lakhs.toFixed(2)}` : sum_shap_lakhs.toFixed(2)} Lakhs
          </span>
          <span className="block text-[11px] text-slate-400">Sum of all feature weights</span>
        </div>

        <div>
          <span className="block text-xs font-medium text-slate-500">Final Estimated Price</span>
          <span className="text-xl font-extrabold text-blue-600">
            {formatPriceLakhs(predictedLakhs)}
          </span>
          <span className="block text-[11px] text-slate-400">Baseline + Net Impact</span>
        </div>
      </div>

      {/* Feature Contributions Waterfall List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-800">Feature Contribution Breakdown</h4>
          <div className="flex items-center space-x-4 text-xs font-medium">
            <span className="flex items-center text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" /> Increases Price
            </span>
            <span className="flex items-center text-rose-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5" /> Decreases Price
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {feature_contributions.map((item, idx) => {
            const isPositive = item.effect === 'positive';
            const barWidthPercent = Math.min(100, Math.round((Math.abs(item.shap_lakhs) / maxAbsShap) * 100));

            return (
              <div key={idx} className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-800 flex items-center space-x-1.5">
                    {isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span>{item.display_name}</span>
                  </span>

                  <span className={isPositive ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {isPositive ? '+' : ''}{item.shap_lakhs.toFixed(2)} Lakhs ({isPositive ? '+' : ''}{formatPriceINR(Math.abs(item.shap_inr))})
                  </span>
                </div>

                {/* Contribution Visual Bar */}
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${barWidthPercent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Drivers Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Positive Drivers */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1 text-emerald-600" />
            Top Value Drivers
          </h5>
          <ul className="text-xs text-slate-700 space-y-1.5">
            {positive_contributions.slice(0, 3).map((p, i) => (
              <li key={i} className="flex justify-between">
                <span>{p.display_name}</span>
                <span className="font-semibold text-emerald-700">+{p.shap_lakhs.toFixed(2)}L</span>
              </li>
            ))}
            {positive_contributions.length === 0 && (
              <li className="text-slate-400 italic">No positive drivers for this combination.</li>
            )}
          </ul>
        </div>

        {/* Negative Drivers */}
        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100">
          <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center">
            <TrendingDown className="w-4 h-4 mr-1 text-rose-600" />
            Negative Value Drag
          </h5>
          <ul className="text-xs text-slate-700 space-y-1.5">
            {negative_contributions.slice(0, 3).map((n, i) => (
              <li key={i} className="flex justify-between">
                <span>{n.display_name}</span>
                <span className="font-semibold text-rose-700">{n.shap_lakhs.toFixed(2)}L</span>
              </li>
            ))}
            {negative_contributions.length === 0 && (
              <li className="text-slate-400 italic">No negative feature drags for this combination.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Model Limitations Notice */}
      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-slate-600 flex items-start space-x-2">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p>
          <strong>Scientific Methodology:</strong> SHAP (SHapley Additive exPlanations) uses cooperative game theory to guarantee consistent, fair local feature attributions. Values indicate how much each property attribute pushed the valuation higher or lower relative to the national market baseline of ~₹{baseline_lakhs.toFixed(1)} Lakhs.
        </p>
      </div>

    </div>
  );
};
