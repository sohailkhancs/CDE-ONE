import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingFallback: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin">
            <Loader2 className="w-full h-full text-red-600 animate-spin" />
          </div>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-lg font-semibold text-slate-700">Loading...</h2>
          <p className="text-sm text-slate-500">Please wait while we prepare your workspace</p>
        </div>

        {/* Skeleton bars for visual feedback */}
        <div className="w-64 space-y-3 mt-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
            <div className="flex-1 h-4 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
            <div className="flex-1 h-4 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
            <div className="flex-1 h-4 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingFallback;
