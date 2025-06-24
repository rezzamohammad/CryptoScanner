/**
 * LoadingState Component
 * 
 * Displays loading spinner and status messages for AI analysis
 * Used within the AIStrategyModal during data fetching
 */

'use client';

import { Sparkles } from 'lucide-react';

interface LoadingStateProps {
  isDark: boolean;
  symbol: string;
}

export function LoadingState({ isDark, symbol }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-emerald-200 rounded-full animate-spin border-t-emerald-500 neon-emerald-glow"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
        </div>
      </div>
      <p className={`mt-4 text-lg font-medium ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        Gemini is analyzing market data for {symbol}...
      </p>
      <p className={`text-sm ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Processing technical indicators and market sentiment
      </p>
    </div>
  );
}
