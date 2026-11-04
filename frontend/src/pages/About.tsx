import React from 'react';
import {
  Award,
  BookOpen,
  Database,
  Cpu,
  Sparkles,
  ShieldAlert,
  Layers,
  ArrowRight,
  ExternalLink,
  Code2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Title Banner */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <Award className="w-4 h-4 text-blue-600" />
          <span>B.Tech Computer Science & Data Science Capstone Project</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          House Price Prediction Using Machine Learning and Explainable AI
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          HouseEstiMate: An academic end-to-end full-stack Indian residential real-estate discovery and empirical property valuation platform.
        </p>
      </div>

      {/* Abstract / Problem Statement */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span>Problem Statement & Academic Motivation</span>
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Residential real-estate pricing in India is notoriously opaque and asymmetric. Traditional online real-estate portals offer either subjective broker quotation listings or simplistic rule-based calculators that lack transparent statistical justification. Furthermore, standard black-box machine learning models fail to explain <em>why</em> a specific property is appraised at a given value.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>HouseEstiMate</strong> solves this by synthesizing genuine Kaggle Indian residential listing data across 7 metropolitan tech hubs with modern regression ensembles (Gradient Boosting, XGBoost, Random Forests) and game-theoretic Explainable AI (SHAP TreeExplainer). Users not only receive an algorithmic valuation, but also an exact, mathematically verified breakdown of every contributing factor.
        </p>
      </section>

      {/* Dataset & Data Preprocessing */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600" />
          <span>Dataset Source & Scientific Data Cleaning</span>
        </h2>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            <strong>Primary Candidate Dataset:</strong> <a href="https://www.kaggle.com/datasets/rakkesharv/real-estate-data-from-7-indian-cities" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold inline-flex items-center">Real Estate Data from 7 Indian Cities (rakkesharv)<ExternalLink className="w-3 h-3 ml-1" /></a>.
          </p>
          <p>
            The raw dataset comprises 14,528 genuine web-scraped listings spanning Bangalore, Pune, New Delhi, Chennai, Kolkata, Mumbai, and Hyderabad.
          </p>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800">Cleaning & Pipeline Specifications:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong>Price Extraction:</strong> Regular expressions parsed varied Indian notations (₹ Cr, ₹ L, Rs Lakh) into exact numerical INR and Lakhs. 3 unlabelled unit-less entries were dropped.</li>
              <li><strong>Zero Target Leakage:</strong> Price per square foot (`Price_per_SQFT`) is derived from the target and is strictly barred from model feature inputs.</li>
              <li><strong>Physical Outlier Boundaries:</strong> Area bounded to 150 - 12,000 sq ft; price bounded to ₹5 Lakhs - ₹40 Crores to eliminate data recording anomalies.</li>
              <li><strong>Engineered Features:</strong> Computed `area_per_bhk` (average room spaciousness) as an orthogonal predictor without leaking target signal.</li>
              <li><strong>Train/Test Isolation:</strong> Preprocessing pipelines (`OneHotEncoder` and `StandardScaler`) were fitted exclusively on the 80% training split (11,559 records) and evaluated on 2,890 held-out test listings.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Machine Learning & SHAP Methodology */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-indigo-600" />
          <span>Machine Learning Models & SHAP Explainability</span>
        </h2>
        
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>
            Five regression algorithms were trained and cross-compared:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-900 block">1. Linear Regression</span>
              <span>Baseline parametric linear combination; R² = 0.397.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-900 block">2. Decision Tree Regressor</span>
              <span>Non-linear recursive partitioning with depth constraints; R² = 0.393.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-900 block">3. Random Forest Regressor</span>
              <span>150 bootstrap bagged trees; R² = 0.435, MAE = ₹46.0L.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-900 block">4. Gradient Boosting Regressor</span>
              <span>Sequential gradient-boosted trees; Champion model with R² = 0.476, RMSE = ₹108.5L.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl sm:col-span-2">
              <span className="font-bold text-slate-900 block">5. Extreme Gradient Boosting (XGBoost)</span>
              <span>Regularized boosting with column subsampling; R² = 0.452.</span>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center">
              <Sparkles className="w-4 h-4 mr-1 text-indigo-600" />
              SHAP Cooperative Game Theory Principle
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              SHAP assigns each feature an importance value for a particular prediction based on Shapley values. Our system utilizes <code>shap.TreeExplainer</code>, enforcing the local additivity property:
            </p>
            <div className="bg-white p-2.5 rounded-lg border border-indigo-200 text-center font-mono text-xs text-indigo-950 font-bold">
              f(x) = E[f(x)] + Σ Φ_i (Baseline + Positive/Negative Features = Output)
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Grid */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Code2 className="w-5 h-5 text-blue-600" />
          <span>Full-Stack Architecture & Technology Stack</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Frontend Layer</h4>
            <ul className="space-y-1 text-slate-600">
              <li>• React 19 + TypeScript</li>
              <li>• Vite 8 Build Tool</li>
              <li>• Tailwind CSS v4 Engine</li>
              <li>• Recharts Interactive SVGs</li>
              <li>• Lucide React Icons</li>
              <li>• React Router Dom</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Backend API Layer</h4>
            <ul className="space-y-1 text-slate-600">
              <li>• Python 3.11 + FastAPI</li>
              <li>• Uvicorn ASGI Server</li>
              <li>• Pydantic v2 Schema Validation</li>
              <li>• SQLAlchemy 2.0 ORM</li>
              <li>• SQLite Local Database</li>
              <li>• Pytest Integration Suite</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Machine Learning Layer</h4>
            <ul className="space-y-1 text-slate-600">
              <li>• Scikit-learn Pipeline</li>
              <li>• SHAP TreeExplainer</li>
              <li>• XGBoost Regressor</li>
              <li>• Pandas & NumPy</li>
              <li>• Matplotlib & Seaborn</li>
              <li>• Joblib Serialization</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Academic Limitations & Future Work */}
      <section className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <span>Methodological Limitations & Future Enhancements</span>
        </h2>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            <strong>1. Location Granularity:</strong> Models can only learn geographical boundaries present in the training set. City-level features generalize well across metros, but exact street-level or gated enclave price variations require hyper-local micro-locality geocoding.
          </p>
          <p>
            <strong>2. Image Provenance:</strong> The Kaggle dataset contains structured numerical listings and text descriptions, but lacks original verified high-resolution photographs. To maintain academic honesty, all interior room photographs and facade assets are explicitly identified as curated illustrative demo images.
          </p>
          <p>
            <strong>3. Future Extensions:</strong> Incorporating Computer Vision (CNN/ViT embeddings from room photographs) into multimodal pricing networks, temporal time-series appreciation forecasting, and integration with state government registration registries.
          </p>
        </div>
      </section>

      {/* Action Links */}
      <div className="text-center pt-4">
        <Link
          to="/explore"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-transform hover:scale-105"
        >
          <span>Explore HouseEstiMate Platform</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
