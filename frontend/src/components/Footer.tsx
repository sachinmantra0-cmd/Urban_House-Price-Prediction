import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, Database, Award, ExternalLink, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & Project Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">HouseEstiMate</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-Stack Indian Real Estate Property Discovery & Machine Learning Price Prediction Platform with Explainable AI (SHAP).
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              <span>B.Tech CS/DS Final Project</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explore" className="hover:text-blue-400 transition-colors">Explore Houses</Link>
              </li>
              <li>
                <Link to="/predict" className="hover:text-blue-400 transition-colors">Predict House Price</Link>
              </li>
              <li>
                <Link to="/models" className="hover:text-blue-400 transition-colors">Model Comparison</Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-blue-400 transition-colors">Market Analytics</Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-blue-400 transition-colors">Property Comparison</Link>
              </li>
              <li>
                <Link to="/favourites" className="hover:text-blue-400 transition-colors">Saved Favourites</Link>
              </li>
            </ul>
          </div>

          {/* Machine Learning & AI */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">ML & Explainable AI</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center space-x-2">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gradient Boosting Regressor</span>
              </li>
              <li className="flex items-center space-x-2">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>TreeExplainer SHAP Values</span>
              </li>
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Strict Mathematical Additivity</span>
              </li>
              <li className="flex items-center space-x-2">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>14,400+ Genuine Records</span>
              </li>
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Zero Target Feature Leakage</span>
              </li>
            </ul>
          </div>

          {/* Data Provenance & Academic Viva */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Academic Review</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Dataset: Kaggle Indian 7-City Real Estate Listings (rakkesharv). Images are illustrative permitted sample architecture assets.
            </p>
            <div className="text-xs text-slate-400 space-y-1">
              <p><strong className="text-slate-300">Target Currency:</strong> Indian National Rupees (INR)</p>
              <p><strong className="text-slate-300">Validation Split:</strong> 80% Train / 20% Test</p>
              <p><strong className="text-slate-300">Stack:</strong> React, Vite, FastAPI, Scikit-learn</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} HouseEstiMate. Academic Capstone Project. All models and evaluations run on real dataset.</p>
          <div className="flex items-center space-x-6">
            <Link to="/about" className="hover:text-slate-400">Documentation & Methodology</Link>
            <a
              href="https://www.kaggle.com/datasets/rakkesharv/real-estate-data-from-7-indian-cities"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 hover:text-slate-400"
            >
              <span>Kaggle Dataset</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
