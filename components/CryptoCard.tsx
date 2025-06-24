'use client';

import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AIStrategyModal } from './AIStrategyModal';
import { CryptoDetailModal } from './CryptoDetailModal';

interface CryptoCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  signal: string;
  chartData: number[];
  isDark: boolean;
}

export function CryptoCard({
  symbol,
  name,
  price,
  change,
  volume,
  signal,
  chartData,
  isDark,
}: CryptoCardProps) {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const isPositive = change > 0;
  const isNeutral = change === 0;
  const isPumpSignal = signal === 'PUMP';
  const isDumpSignal = signal === 'DUMP';
  const isNeutralSignal = signal === 'NEUTRAL';

  // Generate SVG path for mini chart
  const generatePath = (data: number[]) => {
    const width = 140;
    const height = 35;
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

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open detail modal if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setShowDetailModal(true);
  };

  // Get appropriate shadow classes based on signal type and percentage change
  const getCardShadowClasses = () => {
    if (isDumpSignal) {
      return 'neon-red-sm hover:neon-red-lg';
    }
    if (isPumpSignal) {
      return 'neon-green-sm hover:neon-green-lg';
    }
    // For NEUTRAL signals, use color based on percentage change
    if (isNeutralSignal) {
      return isPositive 
        ? 'neon-green-sm hover:neon-green-lg'
        : 'neon-red-sm hover:neon-red-lg';
    }
    return 'neon-green-sm hover:neon-green-lg';
  };

  const getChangeBadgeShadowClasses = () => {
    if (isPositive) {
      return 'neon-green-sm';
    }
    if (!isNeutral) {
      return 'neon-red-sm';
    }
    return '';
  };

  const getSignalShadowClasses = () => {
    if (isDumpSignal) {
      return 'neon-red-sm';
    }
    if (isPumpSignal) {
      return 'neon-green-sm';
    }
    // For NEUTRAL signals, use color based on percentage change
    if (isNeutralSignal) {
      return isPositive 
        ? 'neon-green-sm'
        : 'neon-red-sm';
    }
    return '';
  };

  const getSignalTextColor = () => {
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
      return 'bg-gradient-to-br from-red-500/5 to-pink-500/5';
    }
    if (isPumpSignal) {
      return 'bg-gradient-to-br from-emerald-500/5 to-teal-500/5';
    }
    // For NEUTRAL signals, use color based on percentage change
    if (isNeutralSignal) {
      return isPositive 
        ? 'bg-gradient-to-br from-emerald-500/5 to-teal-500/5'
        : 'bg-gradient-to-br from-red-500/5 to-pink-500/5';
    }
    return isPositive 
      ? 'bg-gradient-to-br from-emerald-500/5 to-teal-500/5' 
      : 'bg-gradient-to-br from-red-500/5 to-pink-500/5';
  };

  return (
    <>
      <div 
        className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
          isDark 
            ? `bg-gray-800/67 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800/77 ${getCardShadowClasses()}` 
            : `bg-white/87 backdrop-blur-sm border border-gray-200 hover:bg-white ${getCardShadowClasses()}`
        }`}
        onClick={handleCardClick}
      >
        {/* Gradient overlay */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          getGradientOverlayClasses()
        }`} />
        
        <div className="relative p-4">
          {/* Header Section - Symbol and Change Badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <h3 className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {symbol}
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {name}
              </p>
            </div>
            
            <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
              isPositive
                ? `bg-emerald-500/20 text-emerald-400 ${getChangeBadgeShadowClasses()}`
                : isNeutral
                ? isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                : `bg-red-500/20 text-red-400 ${getChangeBadgeShadowClasses()}`
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : !isNeutral ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              {change > 0 ? '+' : ''}{change.toFixed(2)}%
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-4">
            <div className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {formatPrice(price)}
            </div>
          </div>

          {/* Volume and Signal Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <p className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                24h Volume
              </p>
              <p className={`text-sm font-semibold ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {volume}
              </p>
            </div>
            
            <div className="flex flex-col items-end">
              <p className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Signal
              </p>
              <div className={`inline-block rounded-lg ${getSignalShadowClasses()}`}>
                <p className={`text-sm font-semibold ${getSignalTextColor()}`}>
                  {signal}
                </p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="w-full flex justify-center mb-4">
            <svg width="140" height="35" className="overflow-visible">
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
                <linearGradient id={`gradient-${symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={getChartColor()} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={getChartColor()} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`${generatePath(chartData)} L 140 35 L 0 35 Z`}
                fill={`url(#gradient-${symbol})`}
              />
            </svg>
          </div>

          {/* Action Button Section - Always present */}
          <div className="w-full">
            {isPumpSignal && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAIModal(true);
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 neon-green-md hover:neon-green-xl text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Strategy Report</span>
              </button>
            )}

            {isDumpSignal && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Could open a dump analysis modal in the future
                }}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 neon-red-md hover:neon-red-xl text-sm"
              >
                <TrendingDown className="w-4 h-4" />
                <span>DUMP Alert</span>
              </button>
            )}

            {isNeutralSignal && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // No action for neutral signals
                }}
                className={`w-full font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 text-sm cursor-default ${
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