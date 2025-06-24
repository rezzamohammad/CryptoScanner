/**
 * ErrorState Component
 * 
 * Displays error messages and financial disclaimers when AI analysis fails
 * Used within the AIStrategyModal when data fetching encounters errors
 */

'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  isDark: boolean;
  symbol: string;
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
}

export function ErrorState({ isDark, symbol, error, isLoading, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <AlertTriangle className={`w-16 h-16 ${
        isDark ? 'text-red-400' : 'text-red-500'
      }`} />

      <div className="text-center space-y-3">
        <p className={`text-lg font-medium ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          AI Analysis Unavailable
        </p>
        <p className={`text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {error || `Unable to connect to AI analysis service for ${symbol}. Please try again later.`}
        </p>
      </div>



      <button
        onClick={onRetry}
        disabled={isLoading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isDark
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50'
        }`}
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>{isLoading ? 'Connecting...' : 'Retry Connection'}</span>
      </button>
    </div>
  );
}
