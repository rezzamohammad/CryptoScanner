'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Zap, Star } from 'lucide-react';
import { ApiClient, wsClient } from '@/lib/apiClient';
import { transformBackendData, mapSettingsToBackend, type FrontendCryptoData } from '@/lib/dataTransformers';
import { handleApiError, retryWithBackoff, logError } from '@/lib/errorHandling';
import { useTheme } from '@/hooks/useTheme';
import { useFavorites } from '@/hooks/useFavorites';
import { useDetectionSettings } from '@/hooks/useDetectionSettings';
import { useDisplaySettings } from '@/hooks/useDisplaySettings';
import { useCryptoData } from '@/hooks/useCryptoData';
import { CryptoCard } from '@/components/CryptoCard';
import { CryptoListItem } from '@/components/CryptoListItem';
import { ControlsPanel } from '@/components/ControlsPanel';
import { PumpDumpTracker } from '@/components/PumpDumpTracker';
import { SearchBox } from '@/components/SearchBox';
import { FilterDropdown } from '@/components/FilterDropdown';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ViewToggle } from '@/components/ViewToggle';
import { CryptoDisplayControls } from '@/components/CryptoDisplayControls';

// Mock data for fallback (will be replaced by API data)
const MOCK_CRYPTO_DATA = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 0,
    change: 0,
    volume: '0',
    signal: 'NEUTRAL',
    chartData: [0, 0, 0, 0, 0, 0],
    detectionTime: new Date('2025-01-27T09:15:00'),
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 0,
    change: 0,
    volume: '0',
    signal: 'NEUTRAL',
    chartData: [0, 0, 0, 0, 0, 0],
    detectionTime: new Date('2025-01-27T08:45:00'),
  },
];

// Add this style block at the top (or use your CSS file)
const flexColumnReverseLeft = `
  .flex-column-reverse-left {
    display: flex;
    flex-direction: column-reverse;
    align-items: flex-start;
  }
`;

export default function Home() {
  // Theme management using custom hook
  const { isDark, isThemeLoaded, setIsDark } = useTheme();
  
  // Favorites management using custom hook
  const { favorites, isDataLoaded, toggleFavorite, setFavorites } = useFavorites(isThemeLoaded);
  
  // Detection settings using custom hook
  const { 
    detectionModel, 
    priceSensitivity, 
    volumeSensitivity,
    setDetectionModel,
    setPriceSensitivity,
    setVolumeSensitivity
  } = useDetectionSettings(isThemeLoaded);
  
  // Display settings using custom hook
  const {
    currentView,
    displayCount,
    tickerSearch,
    sortOption,
    showOnlyFavorites,
    setCurrentView,
    setDisplayCount,
    setTickerSearch,
    setSortOption,
    setShowOnlyFavorites
  } = useDisplaySettings(isThemeLoaded, isDataLoaded, favorites.size);
  
  // Crypto data management using custom hook
  const { cryptoData, connectionStatus, lastUpdateTime, setCryptoData } = useCryptoData(
    detectionModel,
    priceSensitivity,
    volumeSensitivity,
    isThemeLoaded
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState('default');

  // Legacy state (to be removed in future cleanup)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Theme management is now handled by useTheme hook
  // Favorites management is now handled by useFavorites hook
  // Detection settings are now handled by useDetectionSettings hook
  // Display settings are now handled by useDisplaySettings hook
  // Crypto data management is now handled by useCryptoData hook

  // WebSocket management is now handled by useCryptoData hook

  // Settings synchronization is now handled by useCryptoData hook

  // Settings synchronization is now handled by custom hooks

  // Convert volume string to number for sorting
  const parseVolume = (volume: string) => {
    const num = parseFloat(volume.replace(/[^\d.]/g, ''));
    if (volume.includes('B')) return num * 1000000000;
    if (volume.includes('M')) return num * 1000000;
    if (volume.includes('K')) return num * 1000;
    return num;
  };

  // Filter and sort crypto data
  const getFilteredAndSortedData = () => {
    let filtered = [...cryptoData];

    // Apply search query filter (existing functionality)
    if (searchQuery.trim()) {
      filtered = filtered.filter(crypto =>
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply ticker search filter (new functionality)
    if (tickerSearch.trim()) {
      const tickers = tickerSearch
        .split(',')
        .map(ticker => ticker.trim().toUpperCase())
        .filter(ticker => ticker.length > 0);
      
      if (tickers.length > 0) {
        filtered = filtered.filter(crypto =>
          tickers.some(ticker => 
            crypto.symbol.toUpperCase().includes(ticker) ||
            crypto.name.toUpperCase().includes(ticker)
          )
        );
      }
    }

    // Apply favorites filter with safety check
    if (showOnlyFavorites) {
      // Safety check: If no favorites exist, don't filter (prevents empty results)
      if (favorites.size > 0) {
        filtered = filtered.filter(crypto => favorites.has(crypto.symbol));
      } else {
        // If showOnlyFavorites is true but no favorites exist, reset the flag
        console.warn('⚠️ showOnlyFavorites is true but no favorites exist, resetting filter');
        setShowOnlyFavorites(false);
      }
    }

    // Apply filters (existing functionality)
    switch (currentFilter) {
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'volume-desc':
        filtered.sort((a, b) => parseVolume(b.volume) - parseVolume(a.volume));
        break;
      case 'volume-asc':
        filtered.sort((a, b) => parseVolume(a.volume) - parseVolume(b.volume));
        break;
      case 'change-desc':
        filtered.sort((a, b) => b.change - a.change);
        break;
      case 'change-asc':
        filtered.sort((a, b) => a.change - b.change);
        break;
      case 'signal-pump':
        filtered = filtered.filter(crypto => crypto.signal === 'PUMP');
        break;
      case 'signal-neutral':
        filtered = filtered.filter(crypto => crypto.signal === 'NEUTRAL');
        break;
      case 'signal-dump':
        filtered = filtered.filter(crypto => crypto.signal === 'DUMP');
        break;
      case 'detection-latest':
        filtered.sort((a, b) => b.detectionTime.getTime() - a.detectionTime.getTime());
        break;
      case 'detection-oldest':
        filtered.sort((a, b) => a.detectionTime.getTime() - b.detectionTime.getTime());
        break;
      default:
        // Apply new sort options
        switch (sortOption) {
          case 'name-asc':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'name-desc':
            filtered.sort((a, b) => b.name.localeCompare(a.name));
            break;
          case 'volume-desc':
            filtered.sort((a, b) => parseVolume(b.volume) - parseVolume(a.volume));
            break;
          case 'volume-asc':
            filtered.sort((a, b) => parseVolume(a.volume) - parseVolume(b.volume));
            break;
          case 'change-desc':
            filtered.sort((a, b) => b.change - a.change);
            break;
          case 'change-asc':
            filtered.sort((a, b) => a.change - b.change);
            break;
          case 'signal-pump':
            filtered = filtered.filter(crypto => crypto.signal === 'PUMP');
            break;
          case 'signal-neutral':
            filtered = filtered.filter(crypto => crypto.signal === 'NEUTRAL');
            break;
          case 'signal-dump':
            filtered = filtered.filter(crypto => crypto.signal === 'DUMP');
            break;
          case 'detection-latest':
            filtered.sort((a, b) => b.detectionTime.getTime() - a.detectionTime.getTime());
            break;
          case 'detection-oldest':
            filtered.sort((a, b) => a.detectionTime.getTime() - b.detectionTime.getTime());
            break;
          default:
            // Keep original order
            break;
        }
        break;
    }

    // Separate favorites and non-favorites, then apply display limit
    const favoriteItems = filtered.filter(crypto => favorites.has(crypto.symbol));
    const nonFavoriteItems = filtered.filter(crypto => !favorites.has(crypto.symbol));

    // If showing only favorites, return all favorites up to display count
    if (showOnlyFavorites) {
      return favoriteItems.slice(0, displayCount);
    }

    // Otherwise, show favorites first, then fill with non-favorites up to displayCount
    const result = [...favoriteItems];
    const remainingSlots = displayCount - favoriteItems.length;
    
    if (remainingSlots > 0) {
      result.push(...nonFavoriteItems.slice(0, remainingSlots));
    }

    return result.slice(0, displayCount);
  };

  // Memoized filtered data computation to prevent stale closures
  const filteredCryptoData = useMemo(() => {
    return getFilteredAndSortedData();
  }, [cryptoData, searchQuery, tickerSearch, currentFilter, sortOption, favorites, showOnlyFavorites, displayCount]);

  // Debug logging for favorites filter issue (fixed stale closure)
  useEffect(() => {
    if (showOnlyFavorites) {
      console.log('🔍 Debug - Favorites Filter Active:', {
        showOnlyFavorites,
        favoritesCount: favorites.size,
        favoritesList: Array.from(favorites),
        tickerSearch,
        filteredResultsCount: filteredCryptoData.length,
        isDataLoaded,
        totalCryptoData: cryptoData.length
      });
    }
  }, [showOnlyFavorites, favorites.size, tickerSearch, filteredCryptoData.length, isDataLoaded, cryptoData.length]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filterType: string) => {
    setCurrentFilter(filterType);
  };

  const handleThemeToggle = () => {
    setIsDark(!isDark);
  };

  const handleViewChange = (view: 'grid' | 'list') => {
    setCurrentView(view);
  };

  // Don't render until theme is loaded to prevent hydration mismatch
  if (!isThemeLoaded) {
    return null;
  }

  // Show loading state while fetching initial data
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark
          ? 'bg-gradient-to-br from-[#00110c] via-black to-[#110000]'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center neon-emerald-glow mb-4 mx-auto">
            <Zap className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Loading CryptoScanner
          </h2>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Connecting to market data...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error and no fallback data
  if (error && cryptoData.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark
          ? 'bg-gradient-to-br from-[#00110c] via-black to-[#110000]'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className={`text-xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Connection Failed
          </h2>
          <p className={`text-sm mb-4 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {error}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 neon-green-md w-full"
            >
              Retry Connection
            </button>
            <button
              onClick={() => {
                // Enable mock fallback and reload
                localStorage.setItem('force-mock-data', 'true');
                window.location.reload();
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 w-full"
            >
              Use Demo Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-[#00110c] via-black to-[#110000]' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      {/* Inline style for demo, move to CSS file in production */}
      <style>{flexColumnReverseLeft}</style>
      <div className="container mx-auto px-4 py-6">
        {/* Connection Status Banner */}
        {error && connectionStatus === 'disconnected' && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg mb-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <span className="font-medium">⚠️ Connection Issue:</span>
              <span>{error}</span>
              <button
                onClick={() => window.location.reload()}
                className="ml-2 underline hover:no-underline font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center neon-emerald-glow">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse neon-emerald-pulse"></div>
            </div>
            <h1 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Crypto<span className="text-emerald-500" style={{
                textShadow: '0 0 5px rgba(16, 185, 129, 0.25)'
              }}>Scanner</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-500 neon-emerald-pulse'
                  : connectionStatus === 'connecting'
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-red-500 animate-pulse'
              }`}></div>
              <span className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {connectionStatus === 'connected' ? 'connected' :
                 connectionStatus === 'connecting' ? 'connecting...' : 'disconnected'}
              </span>
              {lastUpdateTime && connectionStatus === 'connected' && (
                <span className={`text-xs ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  • {lastUpdateTime.toLocaleTimeString()}
                </span>
              )}
              {/* {settingsLoading && (
                <span className={`text-xs px-2 py-1 rounded-lg ${
                  isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                }`}>
                  ⚙️ Syncing...
                </span>
              )} */}
            </div>
            
            {/* New Slider Theme Toggle */}
            <ThemeToggle isDark={isDark} onToggle={handleThemeToggle} />
          </div>
        </div>

        {/* Controls and Search Section */}
        <div className="mb-8">
          {/* Settings Panel - Full width */}
          <div className="mb-6">
            <ControlsPanel
              isDark={isDark}
              detectionModel={detectionModel}
              setDetectionModel={setDetectionModel}
              priceSensitivity={priceSensitivity}
              setPriceSensitivity={setPriceSensitivity}
              volumeSensitivity={volumeSensitivity}
              setVolumeSensitivity={setVolumeSensitivity}
              settingsLoading={false}
            />
          </div>

          {/* Horizontal Layout: Pump/Dump Tracker and Display Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Pump/Dump Tracker - Left side */}
            <PumpDumpTracker 
              isDark={isDark} 
              cryptoData={cryptoData}
            />

            {/* Crypto Display Controls - Right side */}
            <CryptoDisplayControls
              isDark={isDark}
              displayCount={displayCount}
              setDisplayCount={setDisplayCount}
              tickerSearch={tickerSearch}
              setTickerSearch={setTickerSearch}
              sortOption={sortOption}
              setSortOption={setSortOption}
              favorites={favorites}
              showOnlyFavorites={showOnlyFavorites}
              setShowOnlyFavorites={setShowOnlyFavorites}
              currentView={currentView}
              setCurrentView={setCurrentView}
              totalCryptos={cryptoData.length}
              displayedCryptos={filteredCryptoData.length}
            />
          </div>
          
          {/* Search, Filter, and View Toggle Row */}
          <div className="flex items-center space-x-4">
            {/* Search Box - Takes most of the width */}
            <div className="flex-1">
              <SearchBox
                isDark={isDark}
                onSearch={handleSearch}
              />
            </div>

            {/* View Toggle - Fixed width */}
            <div className="flex-shrink-0">
              <ViewToggle
                isDark={isDark}
                currentView={currentView}
                onViewChange={handleViewChange}
              />
            </div>

            {/* Filter Dropdown - Fixed width on the right */}
            <div className="flex-shrink-0">
              <FilterDropdown
                isDark={isDark}
                onFilterChange={handleFilterChange}
                currentFilter={currentFilter}
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {(searchQuery || tickerSearch || currentFilter !== 'default' || showOnlyFavorites) && (
          <div className="mb-6">
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {filteredCryptoData.length > 0 
                ? `Showing ${filteredCryptoData.length} result${filteredCryptoData.length !== 1 ? 's' : ''}${
                    searchQuery ? ` for "${searchQuery}"` : ''
                  }${tickerSearch ? ` matching "${tickerSearch}"` : ''}${
                    currentFilter !== 'default' ? ` (filtered)` : ''
                  }${showOnlyFavorites ? ' (favorites only)' : ''}`
                : searchQuery || tickerSearch
                  ? `No results found for "${searchQuery || tickerSearch}"`
                  : 'No results match the current filter'
              }
              {favorites.size > 0 && !showOnlyFavorites && (
                <span className="ml-2">
                  • {favorites.size} favorite{favorites.size !== 1 ? 's' : ''} saved
                </span>
              )}
            </p>
          </div>
        )}

        {/* Crypto Cards/List */}
        {currentView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCryptoData.map((crypto) => (
              <div key={crypto.symbol} className="relative">
                {/* Favorite Star Overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(crypto.symbol);
                  }}
                  className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-300 ${
                    favorites.has(crypto.symbol)
                      ? 'bg-yellow-500 text-white neon-teal-sm'
                      : 'bg-black/20 text-white/70 hover:bg-black/40 hover:text-white'
                  }`}
                  title={favorites.has(crypto.symbol) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-4 h-4 ${
                    favorites.has(crypto.symbol) ? 'fill-current' : ''
                  }`} />
                </button>
                
                <CryptoCard
                  key={crypto.symbol}
                  isDark={isDark}
                  {...crypto}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {/* List Items */}
            {filteredCryptoData.map((crypto) => (
              <div key={crypto.symbol} className="relative">
                {/* Favorite Star for List View */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(crypto.symbol);
                  }}
                  className={`absolute top-2 left-2 z-10 p-1 rounded-full transition-all duration-300 ${
                    favorites.has(crypto.symbol)
                      ? 'bg-yellow-500 text-white neon-teal-sm'
                      : 'bg-black/20 text-white/70 hover:bg-black/40 hover:text-white'
                  }`}
                  title={favorites.has(crypto.symbol) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-3 h-3 ${
                    favorites.has(crypto.symbol) ? 'fill-current' : ''
                  }`} />
                </button>
                
                <CryptoListItem
                  key={crypto.symbol}
                  isDark={isDark}
                  {...crypto}
                />
              </div>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {(searchQuery || tickerSearch || currentFilter !== 'default' || showOnlyFavorites) && filteredCryptoData.length === 0 && (
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
                : searchQuery || tickerSearch
                  ? 'Try searching for different ticker symbols or names'
                  : 'Try adjusting your filter settings'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
