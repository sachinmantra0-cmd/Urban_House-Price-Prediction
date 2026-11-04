import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  cardsCount?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading real estate data...",
  cardsCount = 6
}) => {
  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center justify-center space-x-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-sm font-semibold">{message}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: cardsCount }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-4 space-y-4 animate-pulse">
            <div className="h-48 bg-slate-200 rounded-xl w-full" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="grid grid-cols-3 gap-2 py-2">
              <div className="h-6 bg-slate-100 rounded" />
              <div className="h-6 bg-slate-100 rounded" />
              <div className="h-6 bg-slate-100 rounded" />
            </div>
            <div className="h-8 bg-slate-200 rounded-xl w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
