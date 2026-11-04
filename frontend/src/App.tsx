import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { PropertyDetails } from './pages/PropertyDetails';
import { PredictPrice } from './pages/PredictPrice';
import { ModelPerformance } from './pages/ModelPerformance';
import { Analytics } from './pages/Analytics';
import { Compare } from './pages/Compare';
import { Favourites } from './pages/Favourites';
import { About } from './pages/About';

export const App: React.FC = () => {
  const [favouritesSet, setFavouritesSet] = useState<Set<string>>(new Set());
  const [comparisonsSet, setComparisonsSet] = useState<Set<string>>(new Set());

  // Load initial favourites and comparisons from backend
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [favs, comps] = await Promise.all([
          api.getFavourites(),
          api.getComparisons()
        ]);
        setFavouritesSet(new Set(favs.map((f) => f.property_id)));
        setComparisonsSet(new Set(comps.map((c) => c.property_id)));
      } catch (err) {
        console.warn("Could not sync user preferences with backend:", err);
      }
    };
    loadPreferences();
  }, []);

  const handleToggleFavourite = async (propertyId: string) => {
    const isFav = favouritesSet.has(propertyId);
    setFavouritesSet((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(propertyId);
      else next.add(propertyId);
      return next;
    });

    try {
      if (isFav) {
        await api.removeFavourite(propertyId);
      } else {
        await api.addFavourite(propertyId);
      }
    } catch (err) {
      console.error("Error toggling favourite:", err);
    }
  };

  const handleToggleComparison = async (propertyId: string) => {
    const isComp = comparisonsSet.has(propertyId);
    setComparisonsSet((prev) => {
      const next = new Set(prev);
      if (isComp) {
        next.delete(propertyId);
      } else {
        if (next.size >= 4) {
          // Keep max 4
          const first = Array.from(next)[0];
          next.delete(first);
        }
        next.add(propertyId);
      }
      return next;
    });

    try {
      if (isComp) {
        await api.removeComparison(propertyId);
      } else {
        await api.addComparison(propertyId);
      }
    } catch (err) {
      console.error("Error toggling comparison:", err);
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar
          favouritesCount={favouritesSet.size}
          comparisonCount={comparisonsSet.size}
        />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  favouritesSet={favouritesSet}
                  comparisonsSet={comparisonsSet}
                  onToggleFavourite={handleToggleFavourite}
                  onToggleComparison={handleToggleComparison}
                />
              }
            />
            <Route
              path="/explore"
              element={
                <Explore
                  favouritesSet={favouritesSet}
                  comparisonsSet={comparisonsSet}
                  onToggleFavourite={handleToggleFavourite}
                  onToggleComparison={handleToggleComparison}
                />
              }
            />
            <Route
              path="/property/:id"
              element={
                <PropertyDetails
                  favouritesSet={favouritesSet}
                  comparisonsSet={comparisonsSet}
                  onToggleFavourite={handleToggleFavourite}
                  onToggleComparison={handleToggleComparison}
                />
              }
            />
            <Route path="/predict" element={<PredictPrice />} />
            <Route path="/models" element={<ModelPerformance />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route
              path="/compare"
              element={<Compare onRemoveComparison={handleToggleComparison} />}
            />
            <Route
              path="/favourites"
              element={
                <Favourites
                  comparisonsSet={comparisonsSet}
                  onToggleFavourite={handleToggleFavourite}
                  onToggleComparison={handleToggleComparison}
                />
              }
            />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
