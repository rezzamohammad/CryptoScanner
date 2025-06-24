/**
 * TechnicalIndicatorsDashboard Component
 * 
 * Displays comprehensive technical indicators including RSI, Volume, MACD, and Bollinger Bands
 * with visual elements and detailed analysis
 */

'use client';

import { AnalysisDataWithQuality } from '../../types/ai';

interface TechnicalIndicatorsDashboardProps {
  analysisData: AnalysisDataWithQuality;
  isDark: boolean;
}

export function TechnicalIndicatorsDashboard({ analysisData, isDark }: TechnicalIndicatorsDashboardProps) {
  return (
    <div className={`p-4 rounded-xl relative ${
      isDark ? 'bg-gray-700/50 neon-green-sm' : 'bg-gray-50'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        <span className="mr-2">📊</span>
        Technical Indicators Dashboard
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RSI Indicator - Enhanced */}
        {analysisData.TechnicalIndicators?.RSI ? (
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-gray-600/30 border-gray-500/30' : 'bg-white/70 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  RSI (14)
                </span>
                <div className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  parseFloat(analysisData.TechnicalIndicators.RSI.CurrentRSI || '0') > 70
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : parseFloat(analysisData.TechnicalIndicators.RSI.CurrentRSI || '0') < 30
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  {parseFloat(analysisData.TechnicalIndicators.RSI.CurrentRSI || '0') > 70 ? 'OVERBOUGHT' :
                   parseFloat(analysisData.TechnicalIndicators.RSI.CurrentRSI || '0') < 30 ? 'OVERSOLD' : 'NEUTRAL'}
                </div>
              </div>
              <span className="text-lg font-bold">
                {analysisData.TechnicalIndicators.RSI.Status || ''}
              </span>
            </div>
            <div className={`text-2xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {analysisData.TechnicalIndicators.RSI.CurrentRSI || 'N/A'}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {analysisData.TechnicalIndicators.RSI.Interpretation || 'No interpretation available'}
            </div>
            {/* RSI Visual Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    parseFloat(analysisData.TechnicalIndicators.RSI.CurrentRSI || '0') > 70
                      ? 'bg-red-500'
                      : parseFloat(analysisData.TechnicalIndicators.RSI.CurrentRSI || '0') < 30
                      ? 'bg-green-500'
                      : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(parseFloat(analysisData.TechnicalIndicators.RSI.CurrentRSI || '0'), 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1 text-gray-500">
                <span>0</span>
                <span>30</span>
                <span>70</span>
                <span>100</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-gray-600/30 border-gray-500/30' : 'bg-white/70 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                RSI (14)
              </span>
              <span className="text-sm text-gray-500">N/A</span>
            </div>
            <div className={`text-sm mt-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              RSI data not available from analysis
            </div>
          </div>
        )}

        {/* Volume Analysis - Enhanced */}
        {analysisData.TechnicalIndicators?.Volume ? (
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-gray-600/30 border-gray-500/30' : 'bg-white/70 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Volume (24h)
              </span>
              <span className="text-lg font-bold">
                {analysisData.TechnicalIndicators.Volume.Status || ''}
              </span>
            </div>
            <div className={`text-lg font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {analysisData.TechnicalIndicators.Volume.CurrentVolume ?
                `${parseFloat(analysisData.TechnicalIndicators.Volume.CurrentVolume).toLocaleString()} USDT` :
                'N/A'
              }
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {/* Extract volume spike info from status */}
              {analysisData.TechnicalIndicators.Volume.Status?.includes('spike') ||
               analysisData.TechnicalIndicators.Volume.Status?.includes('Spike') ? (
                <span className="text-green-500 font-medium">
                  High volume activity detected
                </span>
              ) : (
                'Volume analysis available'
              )}
            </div>
          </div>
        ) : (
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-gray-600/30 border-gray-500/30' : 'bg-white/70 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Volume (24h)
              </span>
              <span className="text-sm text-gray-500">N/A</span>
            </div>
            <div className={`text-sm mt-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Volume data not available from analysis
            </div>
          </div>
        )}

        {/* MACD - Only show if data is available */}
        {analysisData.TechnicalIndicators?.MACD && (
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-gray-600/30 border-gray-500/30' : 'bg-white/70 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                MACD
              </span>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                analysisData.TechnicalIndicators.MACD.Status?.includes('Bullish')
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : analysisData.TechnicalIndicators.MACD.Status?.includes('Bearish')
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                {analysisData.TechnicalIndicators.MACD.Status || 'NEUTRAL'}
              </div>
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {analysisData.TechnicalIndicators.MACD.Interpretation || 'MACD analysis available'}
            </div>
            {(analysisData.TechnicalIndicators.MACD as any).Confidence && (
              <div className="mt-2">
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Confidence: {Math.round((analysisData.TechnicalIndicators.MACD as any).Confidence)}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bollinger Bands - Only show if data is available */}
        {analysisData.TechnicalIndicators?.BollingerBands && (
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-gray-600/30 border-gray-500/30' : 'bg-white/70 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Bollinger Bands
              </span>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                analysisData.TechnicalIndicators.BollingerBands.Status?.includes('Resistance')
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  : analysisData.TechnicalIndicators.BollingerBands.Status?.includes('Support')
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {analysisData.TechnicalIndicators.BollingerBands.Status?.split(' - ')[0] || 'NORMAL'}
              </div>
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Position: {analysisData.TechnicalIndicators.BollingerBands.PricePosition || 'N/A'}
            </div>
            {(analysisData.TechnicalIndicators.BollingerBands as any).UpperBand && (
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-red-500">Upper:</span> ${(analysisData.TechnicalIndicators.BollingerBands as any).UpperBand}
                </div>
                <div>
                  <span className="text-blue-500">Middle:</span> ${(analysisData.TechnicalIndicators.BollingerBands as any).MiddleBand}
                </div>
                <div>
                  <span className="text-green-500">Lower:</span> ${(analysisData.TechnicalIndicators.BollingerBands as any).LowerBand}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
