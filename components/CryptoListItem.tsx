'use client';

import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { AIStrategyModal } from './AIStrategyModal';
import { CryptoDetailModal } from './CryptoDetailModal';

interface CryptoListItemProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  signal: string;
  chartData: number[];
  isDark: boolean;
  detectionTime: Date;
}

export function CryptoListItem({
  symbol,
  name,
  price,
  change,
  volume,
  signal,
  chartData,
  isDark,
  detectionTime,
}: CryptoListItemProps) {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const isPositive = (change ?? 0) > 0;
  const isNeutral = (change ?? 0) === 0;
  const isPumpSignal = signal === 'PUMP';
  const isDumpSignal = signal === 'DUMP';
  const isNeutralSignal = signal === 'NEUTRAL';

  // Generate SVG path for mini chart
  const generatePath = (data: number[]) => {
    const width = 120;
    const height = 32;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    return data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(' ');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 4 : 2,
    }).format(price);
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't open detail modal if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setShowDetailModal(true);
  };

  // Get appropriate shadow classes based on signal type and percentage change
  const getRowShadowClasses = () => {
    if (isDumpSignal) {
      return 'neon-red-sm hover:neon-red-md';
    }
    if (isPumpSignal) {
      return 'neon-green-sm hover:neon-green-lg';
    }
    // For NEUTRAL signals, use color based on percentage change
    if (isNeutralSignal) {
      return isPositive 
        ? 'neon-green-sm hover:neon-green-md'
        : 'neon-red-sm hover:neon-red-md';
    }
    return 'neon-green-sm hover:neon-green-md';
  };

  const getSignalColor = () => {
    if (isPumpSignal) {
      return 'text-emerald-400';
    }
    if (isDumpSignal) {
      return 'text-red-400';
    }
    // For NEUTRAL signals, use color based on percentage change
    if (isNeutralSignal) {
      return isPositive 
        ? 'text-emerald-400'
        : 'text-red-400';
    }
    return isDark ? 'text-gray-200' : 'text-gray-700';
  };

  const getChartColor = () => {
    if (isDumpSignal) return '#ef4444';
    if (isPumpSignal) return '#10b981';
    // For NEUTRAL signals, use color based on percentage change
    if (isNeutralSignal) {
      return isPositive ? '#10b981' : '#ef4444';
    }
    return isPositive ? '#10b981' : '#ef4444';
  };

  const getChartGlowFilter = () => {
    if (isDumpSignal) return 'drop-shadow(0 0 2px rgba(239, 68, 68, 0.33))';
    if (isPumpSignal) return 'drop-shadow(0 0 2px rgba(16, 185, 129, 0.33))';
    // For NEUTRAL signals, use color based on percentage change
    if (isNeutralSignal) {
      return isPositive 
        ? 'drop-shadow(0 0 2px rgba(16, 185, 129, 0.33))'
        : 'drop-shadow(0 0 2px rgba(239, 68, 68, 0.33))';
    }
    return isPositive 
      ? 'drop-shadow(0 0 2px rgba(16, 185, 129, 0.33))' 
      : 'drop-shadow(0 0 2px rgba(239, 68, 68, 0.33))';
  };

  const getGradientOverlayClasses = () => {
    if (isDumpSignal) {
      return 'bg-gradient-to-r from-red-500/5 to-pink-500/5';
    }
    if (isPumpSignal) {
      return 'bg-gradient-to-r from-emerald-500/5 to-teal-500/5';
    }
    // For NEUTRAL signals, use color based on percentage change
    if (isNeutralSignal) {
      return isPositive 
        ? 'bg-gradient-to-r from-emerald-500/5 to-teal-500/5'
        : 'bg-gradient-to-r from-red-500/5 to-pink-500/5';
    }
    return isPositive 
      ? 'bg-gradient-to-r from-emerald-500/5 to-teal-500/5' 
      : 'bg-gradient-to-r from-red-500/5 to-pink-500/5';
  };

  return (
    <>
      <div 
        className={`group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.005] cursor-pointer ${
          isDark 
            ? `bg-gray-800/67 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800/77 ${getRowShadowClasses()}` 
            : `bg-white/87 backdrop-blur-sm border border-gray-200 hover:bg-white ${getRowShadowClasses()}`
        }`}
        onClick={handleRowClick}
      >
        {/* Gradient overlay */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          getGradientOverlayClasses()
        }`} />
        
        <div className="relative px-3 py-3">
          <div className="flex items-center gap-4">
            
            {/* Column 1: Ticker & Coin Name (Stacked) - 15% width */}
            <div className="w-[15%] min-w-0">
              <div className={`text-sm font-bold truncate ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {symbol}
              </div>
              <div className={`text-xs truncate ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {name}
              </div>
            </div>

            {/* Column 2: Price & Volume (Stacked Vertically) - 18% width */}
            <div className="w-[18%] min-w-0">
              <div className={`text-sm font-semibold truncate ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {formatPrice(price)}
              </div>
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div>24h Volume</div>
                <div className="font-medium">{volume}</div>
              </div>
            </div>

            {/* Column 3: Percentage & Signal (Stacked Vertically) - 17% width */}
            <div className="w-[17%] min-w-0">
              <div className={`flex items-center text-xs font-medium mb-1 ${
                isPositive
                  ? 'text-emerald-400'
                  : isNeutral
                  ? isDark ? 'text-gray-300' : 'text-gray-600'
                  : 'text-red-400'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 mr-1 flex-shrink-0" />
                ) : !isNeutral ? (
                  <TrendingDown className="w-3 h-3 mr-1 flex-shrink-0" />
                ) : null}
                <span className="truncate">{(change ?? 0) > 0 ? '+' : ''}{(change ?? 0).toFixed(2)}%</span>
              </div>
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div>Signal</div>
                <div className={`font-medium truncate ${getSignalColor()}`}>
                  {signal}
                </div>
              </div>
            </div>

            {/* Column 4: Detected Time - 12% width */}
            <div className="w-[12%] min-w-0">
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div>Detected</div>
                <div className="font-medium">{formatTime(detectionTime)}</div>
              </div>
            </div>

            {/* Column 5: Chart - 18% width, aligned left */}
            <div className="w-[18%] flex justify-start">
              <svg width="120" height="32" className="overflow-visible">
                <path
                  d={generatePath(chartData)}
                  fill="none"
                  stroke={getChartColor()}
                  strokeWidth="2"
                  className="drop-shadow-sm"
                  style={{
                    filter: getChartGlowFilter()
                  }}
                />
                <defs>
                  <linearGradient id={`compact-gradient-${symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={getChartColor()} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={getChartColor()} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`${generatePath(chartData)} L 120 32 L 0 32 Z`}
                  fill={`url(#compact-gradient-${symbol})`}
                />
              </svg>
            </div>

            {/* Column 6: Action Button - 20% width using w-full like cards */}
            <div className="w-[20%]">
              {isPumpSignal && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAIModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-1.5 neon-green-md hover:neon-green-lg text-sm"
                >
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>AI Strategy Report</span>
                </button>
              )}

              {isDumpSignal && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Could open a dump analysis modal in the future
                  }}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-1.5 neon-red-md hover:neon-red-lg text-sm"
                >
                  <TrendingDown className="w-4 h-4 flex-shrink-0" />
                  <span>DUMP Alert</span>
                </button>
              )}

              {isNeutralSignal && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // No action for neutral signals
                  }}
                  className={`w-full font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center text-sm cursor-default ${
                    isDark 
                      ? 'bg-gray-700/50 text-gray-400 border border-gray-600/50' 
                      : 'bg-gray-100 text-gray-500 border border-gray-300'
                  }`}
                  disabled
                >
                  <span>No Action</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Strategy Modal */}
      <AIStrategyModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        symbol={symbol}
        isDark={isDark}
      />

      {/* Crypto Detail Modal */}
      <CryptoDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        crypto={{ symbol, name, price, change, volume, signal, chartData }}
        isDark={isDark}
      />
    </>
  );
}