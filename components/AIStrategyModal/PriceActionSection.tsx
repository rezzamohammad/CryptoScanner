/**
 * PriceActionSection Component
 * 
 * Displays price action analysis including current price, recent high/low,
 * support/resistance levels, and price analysis summary
 */

'use client';

import { AnalysisDataWithQuality } from '../../types/ai';

interface PriceActionSectionProps {
  analysisData: AnalysisDataWithQuality;
  isDark: boolean;
}

export function PriceActionSection({ analysisData, isDark }: PriceActionSectionProps) {
  return (
    <div className={`p-4 rounded-xl relative ${
      isDark ? 'bg-gray-700/50 neon-green-sm' : 'bg-gray-50'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        <span className="mr-2">📈</span>
        Price Action & Key Levels
      </h3>

      {/* Only show price data if at least one field is available */}
      {(analysisData.PriceAction?.CurrentPrice ||
        analysisData.PriceAction?.RecentHigh ||
        analysisData.PriceAction?.RecentLow) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Current Price */}
          {analysisData.PriceAction?.CurrentPrice && (
            <div className={`p-3 rounded-lg border ${
              isDark ? 'bg-gray-600/30 border-gray-500/30' : 'bg-white/70 border-gray-200'
            }`}>
              <div className={`text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Current Price
              </div>
              <div className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {analysisData.PriceAction?.CurrentPrice || 'N/A'}
              </div>
            </div>
          )}

          {/* Recent High */}
          {analysisData.PriceAction?.RecentHigh && (
            <div className={`p-3 rounded-lg border ${
              isDark ? 'bg-gray-600/30 border-gray-500/30' : 'bg-white/70 border-gray-200'
            }`}>
              <div className={`text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Recent High
              </div>
              <div className={`text-lg font-bold text-green-500 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`}>
                {analysisData.PriceAction?.RecentHigh}
              </div>
            </div>
          )}

          {/* Recent Low */}
          {analysisData.PriceAction?.RecentLow && (
            <div className={`p-3 rounded-lg border ${
              isDark ? 'bg-gray-600/30 border-gray-500/30' : 'bg-white/70 border-gray-200'
            }`}>
              <div className={`text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Recent Low
              </div>
              <div className={`text-lg font-bold text-red-500 ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`}>
                {analysisData.PriceAction?.RecentLow}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Support & Resistance Levels - Only show if data is available */}
      {(analysisData.PriceAction?.KeySupport ||
        analysisData.PriceAction?.KeyResistance) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Support Level */}
          {analysisData.PriceAction?.KeySupport && (
            <div className={`p-3 rounded-lg border ${
              isDark ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'
            }`}>
              <div className={`text-sm font-medium mb-2 flex items-center ${
                isDark ? 'text-green-300' : 'text-green-700'
              }`}>
                <span className="mr-2">🟢</span>
                Key Support Level
              </div>
              <div className={`text-lg font-bold ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`}>
                {analysisData.PriceAction?.KeySupport}
              </div>
              <div className={`text-xs mt-1 ${
                isDark ? 'text-green-300/70' : 'text-green-600/70'
              }`}>
                Price level where buying interest may emerge
              </div>
            </div>
          )}

          {/* Resistance Level */}
          {analysisData.PriceAction?.KeyResistance && (
            <div className={`p-3 rounded-lg border ${
              isDark ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'
            }`}>
              <div className={`text-sm font-medium mb-2 flex items-center ${
                isDark ? 'text-red-300' : 'text-red-700'
              }`}>
                <span className="mr-2">🔴</span>
                Key Resistance Level
              </div>
              <div className={`text-lg font-bold ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`}>
                {analysisData.PriceAction?.KeyResistance}
              </div>
              <div className={`text-xs mt-1 ${
                isDark ? 'text-red-300/70' : 'text-red-600/70'
              }`}>
                Price level where selling pressure may increase
              </div>
            </div>
          )}
        </div>
      )}

      {/* Price Analysis Summary */}
      {analysisData.PriceAction?.PriceAnalysis && (
        <div className={`p-3 rounded-lg ${
          isDark ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className={`text-sm font-medium mb-2 ${
            isDark ? 'text-blue-300' : 'text-blue-700'
          }`}>
            Price Action Analysis
          </div>
          <p className={`text-sm ${
            isDark ? 'text-blue-200' : 'text-blue-800'
          }`}>
            {analysisData.PriceAction?.PriceAnalysis}
          </p>
        </div>
      )}
    </div>
  );
}
