'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Settings, Star, Search } from 'lucide-react';

interface CryptoDisplayControlsProps {
  isDark: boolean;
  displayCount: number;
  setDisplayCount: (count: number) => void;
  tickerSearch: string;
  setTickerSearch: (search: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  favorites: Set<string>;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (show: boolean) => void;
  currentView: 'grid' | 'list';
  setCurrentView: (view: 'grid' | 'list') => void;
  totalCryptos: number;
  displayedCryptos: number;
}

export function CryptoDisplayControls({
  isDark,
  displayCount,
  setDisplayCount,
  tickerSearch,
  setTickerSearch,
  sortOption,
  setSortOption,
  favorites,
  showOnlyFavorites,
  setShowOnlyFavorites,
  currentView,
  setCurrentView,
  totalCryptos,
  displayedCryptos,
}: CryptoDisplayControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [inputValue, setInputValue] = useState(displayCount.toString());

  // State to track if component data has been loaded from localStorage
  const [isStateLoaded, setIsStateLoaded] = useState(false);

  // Load component state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('crypto-display-controls-state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);

        // Validate and apply saved state
        if (typeof state.isExpanded === 'boolean') setIsExpanded(state.isExpanded);
        if (typeof state.showSettings === 'boolean') setShowSettings(state.showSettings);

        console.log('📋 Loaded CryptoDisplayControls state from localStorage:', state);
      } catch (error) {
        console.error('❌ Error loading CryptoDisplayControls state:', error);
      }
    } else {
      console.log('📋 No saved CryptoDisplayControls state found, using defaults');
    }

    // Mark state as loaded
    setIsStateLoaded(true);
  }, []);

  // Save component state to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    // Only save after state has been loaded to prevent overwriting with defaults
    if (!isStateLoaded) return;

    const state = { isExpanded, showSettings };

    try {
      localStorage.setItem('crypto-display-controls-state', JSON.stringify(state));
      console.log('💾 Saved CryptoDisplayControls state to localStorage:', state);
    } catch (error) {
      console.error('❌ Error saving CryptoDisplayControls state:', error);
    }
  }, [isExpanded, showSettings, isStateLoaded]);

  // Sync inputValue when displayCount changes externally
  useEffect(() => {
    setInputValue(displayCount.toString());
  }, [displayCount]);

  // Handle slider change
  const handleSliderChange = (value: number) => {
    setDisplayCount(value);
    setInputValue(value.toString());
  };

  // Handle manual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
      setDisplayCount(numValue);
    }
  };

  // Handle input blur to validate and correct
  const handleInputBlur = () => {
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < 1) {
      setDisplayCount(1);
      setInputValue('1');
    } else if (numValue > 100) {
      setDisplayCount(100);
      setInputValue('100');
    }
  };

  const sliderPercentage = ((displayCount - 1) / (100 - 1)) * 100;
  const favoriteCount = favorites.size;

  return (
    <div className={`rounded-2xl transition-all duration-300 ${
      isDark 
        ? 'bg-gray-800/72 backdrop-blur-sm border border-gray-700/50 neon-green-sm' 
        : 'bg-white/87 backdrop-blur-sm border border-gray-200 neon-green-sm'
    }`}>
      
      {/* Toggle Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 transition-all duration-300 hover:${
          isDark ? 'bg-gray-700/30' : 'bg-gray-50/50'
        } rounded-2xl cursor-pointer`}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center neon-emerald-glow">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse neon-emerald-pulse"></div>
          </div>
          
          <h2 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Display Settings
          </h2>

          {isExpanded && (
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium neon-green-sm`}
                style={{ backgroundColor: isDark ? '#1c2129' : '#dadce3', color: isDark ? '#d1d5db' : '#374151' }}>
                {displayedCryptos} shown
              </span>
              {favoriteCount > 0 && (
                <span className={`px-2 py-1 rounded-lg text-xs font-medium neon-teal-sm`}
                  style={{ backgroundColor: isDark ? '#1c2129' : '#dadce3', color: isDark ? '#d1d5db' : '#374151' }}>
                  {favoriteCount} favorites
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Settings Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(!showSettings);
            }}
            className={`p-2 rounded-full transition-all duration-300 neon-green-sm hover:neon-green-md ${
              showSettings ? 'bg-emerald-500 text-white' : ''
            }`}
            style={!showSettings ? { backgroundColor: isDark ? '#1c2129' : '#dadce3' } : {}}
          >
            <Settings className={`w-4 h-4 ${
              showSettings ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-600'
            }`} />
          </button>

          {/* Expand/Collapse Button */}
          <div className={`p-2 rounded-full transition-all duration-300 neon-green-sm`}
            style={{ backgroundColor: isDark ? '#1c2129' : '#dadce3' }}>
            {isExpanded ? (
              <ChevronUp className={`w-5 h-5 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`} />
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && isExpanded && (
        <div className={`px-6 py-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <h3 className={`text-base font-semibold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Display Settings
          </h3>
          
          <div className="space-y-6">
            {/* Display Count Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Number of cryptocurrencies to display
                </label>
                <span className={`text-sm font-bold ${
                  isDark ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  {displayCount} crypto{displayCount !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Horizontal Layout: Slider + Input */}
              <div className="flex items-center space-x-4">
                {/* Slider */}
                <div className="flex-1">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={displayCount}
                    onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                  />
                  
                  <style jsx>{`
                    .slider {
                      background: linear-gradient(to right, #10b981 0%, #10b981 ${sliderPercentage}%, ${isDark ? '#1c2129' : '#d1d5db'} ${sliderPercentage}%, ${isDark ? '#1c2129' : '#d1d5db'} 100%);
                    }
                    
                    .slider::-webkit-slider-thumb {
                      appearance: none;
                      height: 20px;
                      width: 20px;
                      border-radius: 50%;
                      background: #10b981;
                      cursor: pointer;
                      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
                      transition: all 0.15s ease-in-out;
                    }
                    
                    .slider::-webkit-slider-thumb:hover {
                      box-shadow: 0 3px 8px rgba(16, 185, 129, 0.4);
                      transform: scale(1.05);
                    }
                    
                    .slider::-webkit-slider-thumb:active {
                      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.5);
                      transform: scale(1.1);
                    }
                    
                    .slider::-moz-range-thumb {
                      height: 20px;
                      width: 20px;
                      border-radius: 50%;
                      background: #10b981;
                      cursor: pointer;
                      border: none;
                      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
                      transition: all 0.15s ease-in-out;
                    }
                    
                    .slider::-moz-range-thumb:hover {
                      box-shadow: 0 3px 8px rgba(16, 185, 129, 0.4);
                      transform: scale(1.05);
                    }
                    
                    .slider::-moz-range-thumb:active {
                      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.5);
                      transform: scale(1.1);
                    }
                    
                    .slider::-moz-range-track {
                      height: 8px;
                      background: transparent;
                      border: none;
                    }
                  `}</style>
                </div>

                {/* Manual Input */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <label className={`text-sm font-medium whitespace-nowrap ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Or enter:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={inputValue}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className={`w-20 px-2 py-1 rounded-lg border text-sm font-medium transition-all duration-300 text-center ${
                        isDark 
                          ? 'border-gray-600 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                      style={{
                        backgroundColor: isDark ? '#000208' : '#ffffff'
                      }}
                    />
                  </div>
                  <span className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    (1-100)
                  </span>
                </div>
              </div>
            </div>

            {/* Search by Tickers */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Filter by ticker symbols
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={tickerSearch}
                  onChange={(e) => setTickerSearch(e.target.value)}
                  placeholder="Enter crypto tickers (e.g., BTC, ETH, XRP)"
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm transition-all duration-300 ${
                    isDark 
                      ? 'border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                  }`}
                  style={{
                    backgroundColor: isDark ? '#000208' : '#ffffff'
                  }}
                />
              </div>
            </div>

            {/* Favorites Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Favorites
                </label>
                <div className="flex items-center space-x-2">
                  <Star className={`w-4 h-4 ${
                    favoriteCount > 0 ? 'text-yellow-500 fill-current' : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {favoriteCount} saved
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  showOnlyFavorites
                    ? 'bg-yellow-500 text-white neon-teal-md'
                    : 'text-white neon-green-sm hover:neon-green-md'
                }`}
                style={!showOnlyFavorites ? { 
                  backgroundColor: isDark ? '#1c2129' : '#dadce3',
                  color: isDark ? '#ffffff' : '#374151'
                } : {}}
                disabled={favoriteCount === 0}
              >
                {showOnlyFavorites ? 'Show All Cryptocurrencies' : 'Show Only Favorites'}
              </button>
            </div>

            {/* Info Text */}
            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <p>
                {showOnlyFavorites 
                  ? `Showing ${displayedCryptos} favorite cryptocurrencies.`
                  : `Displaying ${displayedCryptos} of ${totalCryptos} cryptocurrencies.`
                }
                {favoriteCount > 0 && !showOnlyFavorites && ` Favorites are shown first.`}
              </p>
              {tickerSearch && (
                <p className="mt-1">
                  Filtered by: {tickerSearch}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-6">
          {displayedCryptos > 0 ? (
            <>
              {/* Empty space where the duplicated text was removed */}
            </>
          ) : (
            /* No Results Message */
            <div className="text-center py-12">
              <div className={`text-6xl mb-4 ${
                isDark ? 'text-gray-700' : 'text-gray-300'
              }`}>
                {showOnlyFavorites ? '⭐' : '🔍'}
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {showOnlyFavorites ? 'No favorites yet' : 'No cryptocurrencies found'}
              </h3>
              <p className={`${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {showOnlyFavorites 
                  ? 'Start adding cryptocurrencies to your favorites by clicking the star icon'
                  : tickerSearch 
                    ? 'Try searching for different ticker symbols'
                    : 'Try adjusting your filter settings'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}