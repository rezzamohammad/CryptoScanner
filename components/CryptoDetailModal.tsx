'use client';

import { X, TrendingUp, TrendingDown, Activity, Volume2, Clock, Target } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CryptoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  crypto: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    volume: string;
    signal: string;
    chartData: number[];
  };
  isDark: boolean;
}

export function CryptoDetailModal({ isOpen, onClose, crypto, isDark }: CryptoDetailModalProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [pumpDumpLevels, setPumpDumpLevels] = useState<any[]>([]);

  const timeframes = ['5M', '15M', '1H', '4H', '1D', '1W'];

  useEffect(() => {
    if (isOpen) {
      // Generate pump/dump levels based on current price
      const currentPrice = crypto.price;
      const levels = [
        {
          level: 1,
          type: 'PUMP',
          price: currentPrice * 1.05,
          percentage: 5,
          probability: 85,
          timeEstimate: '2-5 min'
        },
        {
          level: 2,
          type: 'PUMP',
          price: currentPrice * 1.12,
          percentage: 12,
          probability: 65,
          timeEstimate: '5-15 min'
        },
        {
          level: 3,
          type: 'PUMP',
          price: currentPrice * 1.25,
          percentage: 25,
          probability: 40,
          timeEstimate: '15-30 min'
        },
        {
          level: 4,
          type: 'PUMP',
          price: currentPrice * 1.50,
          percentage: 50,
          probability: 20,
          timeEstimate: '30-60 min'
        },
        {
          level: 1,
          type: 'DUMP',
          price: currentPrice * 0.95,
          percentage: -5,
          probability: 25,
          timeEstimate: '2-5 min'
        },
        {
          level: 2,
          type: 'DUMP',
          price: currentPrice * 0.88,
          percentage: -12,
          probability: 15,
          timeEstimate: '5-15 min'
        }
      ];
      setPumpDumpLevels(levels);
    }
  }, [isOpen, crypto.price]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Generate expanded chart data
  const generateExpandedChartData = () => {
    const baseData = crypto.chartData;
    const expandedData = [];
    
    // Create more data points for smoother chart
    for (let i = 0; i < 50; i++) {
      const baseIndex = Math.floor((i / 50) * (baseData.length - 1));
      const nextIndex = Math.min(baseIndex + 1, baseData.length - 1);
      const progress = ((i / 50) * (baseData.length - 1)) - baseIndex;
      
      const value = baseData[baseIndex] + (baseData[nextIndex] - baseData[baseIndex]) * progress;
      const noise = (Math.random() - 0.5) * (value * 0.02); // Add some realistic noise
      expandedData.push(value + noise);
    }
    
    return expandedData;
  };

  const generateExpandedPath = (data: number[]) => {
    const width = 600;
    const height = 200;
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

  if (!isOpen) return null;

  const expandedData = generateExpandedChartData();
  const isPositive = crypto.change > 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 backdrop-blur-sm ${
          isDark ? 'bg-dark/25 backdrop-blur-sm border border-gray-700/75 hover:bg-dark/25' : 'bg-white/75 backdrop-blur-sm border border-gray-200 hover:bg-white/75 neon-green-md'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-2xl transform transition-all duration-300 ease-out ${
        isDark
          ? 'bg-black/75 backdrop-blur-sm border border-gray-700/75 hover:bg-black/75 neon-green-lg'
          : 'bg-white/75 backdrop-blur-sm border border-gray-200 hover:bg-white/75 neon-green-md'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-4">
            <div>
              <h2 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {crypto.symbol}
              </h2>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {crypto.name}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`text-3xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {formatPrice(crypto.price)}
              </div>
              
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                isPositive
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {crypto.change > 0 ? '+' : ''}{crypto.change.toFixed(2)}%
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white neon-green-sm' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(95vh-120px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Chart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Timeframe Selector */}
              <div className="flex items-center space-x-2">
                {timeframes.map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedTimeframe === timeframe
                        ? 'bg-emerald-500 text-white neon-green-sm'
                        : 'text-gray-300 hover:bg-gray-500 neon-green-sm hover:neon-green-md'
                    }`}
                    style={selectedTimeframe !== timeframe ? { 
                      backgroundColor: isDark ? '#1c2129' : '#dadce3',
                      color: isDark ? '#d1d5db' : '#374151'
                    } : {}}
                    onMouseEnter={(e) => {
                      if (selectedTimeframe !== timeframe) {
                        e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#c4c7d0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTimeframe !== timeframe) {
                        e.currentTarget.style.backgroundColor = isDark ? '#1c2129' : '#dadce3';
                      }
                    }}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>

              {/* Expanded Chart */}
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-gray-700/50 neon-green-sm' : 'bg-gray-50'
              }`}>
                <div className="w-full flex justify-center">
                  <svg width="600" height="200" className="overflow-visible">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 40" fill="none" stroke={isDark ? '#374151' : '#e5e7eb'} strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="600" height="200" fill="url(#grid)" />
                    
                    {/* Chart line */}
                    <path
                      d={generateExpandedPath(expandedData)}
                      fill="none"
                      stroke={isPositive ? '#10b981' : '#ef4444'}
                      strokeWidth="3"
                      className="drop-shadow-sm"
                    />
                    
                    {/* Gradient fill */}
                    <defs>
                      <linearGradient id={`expanded-gradient-${crypto.symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={`${generateExpandedPath(expandedData)} L 600 200 L 0 200 Z`}
                      fill={`url(#expanded-gradient-${crypto.symbol})`}
                    />
                  </svg>
                </div>
              </div>

              {/* Market Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl ${
                  isDark ? 'bg-gray-700/50 neon-green-sm' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Volume2 className={`w-4 h-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      24h Volume
                    </span>
                  </div>
                  <div className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {crypto.volume}
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${
                  isDark ? 'bg-gray-700/50 neon-green-sm' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className={`w-4 h-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Signal
                    </span>
                  </div>
                  <div className={`text-lg font-semibold ${
                    crypto.signal === 'PUMP' 
                      ? 'text-emerald-400' 
                      : isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {crypto.signal}
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${
                  isDark ? 'bg-gray-700/50 neon-green-sm' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className={`w-4 h-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      24h High
                    </span>
                  </div>
                  <div className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatPrice(crypto.price * 1.08)}
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${
                  isDark ? 'bg-gray-700/50 neon-green-sm' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingDown className={`w-4 h-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      24h Low
                    </span>
                  </div>
                  <div className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatPrice(crypto.price * 0.92)}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Pump/Dump Levels */}
            <div className="space-y-6">
              <h3 className={`text-xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Pump/Dump Levels
              </h3>

              <div className="space-y-3">
                {pumpDumpLevels.map((level, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-l-4 ${
                      level.type === 'PUMP'
                        ? 'border-l-emerald-500 bg-emerald-500/10 neon-green-sm'
                        : 'border-l-red-500 bg-red-500/10 neon-red-sm'
                    } ${
                      isDark ? 'bg-gray-700/50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          level.type === 'PUMP'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {level.type} {level.level}
                        </span>
                        <span className={`text-sm font-medium ${
                          level.type === 'PUMP' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {level.percentage > 0 ? '+' : ''}{level.percentage}%
                        </span>
                      </div>
                      
                      <div className={`text-sm font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatPrice(level.price)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <Target className={`w-3 h-3 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                        <span className={`${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {level.probability}% probability
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className={`w-3 h-3 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                        <span className={`${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {level.timeEstimate}
                        </span>
                      </div>
                    </div>

                    {/* Probability bar */}
                    <div className={`mt-2 h-1 rounded-full ${
                      isDark ? 'bg-gray-600' : 'bg-gray-200'
                    }`}>
                      <div
                        className={`h-full rounded-full ${
                          level.type === 'PUMP' ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${level.probability}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Quick Actions
                </h4>
                
                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 neon-green-md hover:neon-green-lg">
                  Set Price Alert
                </button>
                
                <button className={`w-full font-semibold py-3 px-4 rounded-xl transition-all duration-300 text-white neon-green-sm hover:neon-green-md`}
                  style={{ 
                    backgroundColor: isDark ? '#1c2129' : '#dadce3',
                    color: isDark ? '#ffffff' : '#374151'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#c4c7d0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? '#1c2129' : '#dadce3';
                  }}>
                  Add to Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}