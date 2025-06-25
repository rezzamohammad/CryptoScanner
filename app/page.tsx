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
import { useCryptoFiltering } from '@/hooks/useCryptoFiltering';
import { CryptoCard } from '@/components/CryptoCard';
import { CryptoListItem } from '@/components/CryptoListItem';
import { ControlsPanel } from '@/components/ControlsPanel';
import { PumpDumpTracker } from '@/components/PumpDumpTracker';
import { SearchBox } from '@/components/SearchBox';
import { FilterDropdown } from '@/components/FilterDropdown';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ViewToggle } from '@/components/ViewToggle';
import { CryptoDisplayControls } from '@/components/CryptoDisplayControls';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { ConnectionBanner } from '@/components/ConnectionBanner';
import { AppHeader } from '@/components/AppHeader';
import { CryptoGrid } from '@/components/CryptoGrid';
import { CryptoList } from '@/components/CryptoList';
import { NoResultsMessage } from '@/components/NoResultsMessage';

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
  
  // Crypto filtering and sorting using custom hook
  const { filteredCryptoData, parseVolume } = useCryptoFiltering(
    cryptoData,
    searchQuery,
    tickerSearch,
    currentFilter,
    sortOption,
    favorites,
    showOnlyFavorites,
    displayCount,
    isDataLoaded,
    setShowOnlyFavorites
  );

  // Legacy state removed - now using connectionStatus from useCryptoData hook

  // Theme management is now handled by useTheme hook
  // Favorites management is now handled by useFavorites hook
  // Detection settings are now handled by useDetectionSettings hook
  // Display settings are now handled by useDisplaySettings hook
  // Crypto data management is now handled by useCryptoData hook

  // WebSocket management is now handled by useCryptoData hook

  // Settings synchronization is now handled by useCryptoData hook

  // Settings synchronization is now handled by custom hooks
  // Crypto filtering and sorting is now handled by useCryptoFiltering hook

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

  // Show loading state while theme is loading or connecting to data
  if (!isThemeLoaded || connectionStatus === 'connecting') {
    return <LoadingState isDark={isDark} />;
  }

  // Show error state if connection failed and no fallback data
  if (connectionStatus === 'error' && cryptoData.length === 0) {
    return <ErrorState isDark={isDark} error="Failed to connect to market data" />;
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
        <ConnectionBanner error={connectionStatus === 'error' ? 'Connection failed' : null} connectionStatus={connectionStatus} />

        {/* Header */}
        <AppHeader 
          isDark={isDark}
          connectionStatus={connectionStatus}
          lastUpdateTime={lastUpdateTime}
          onThemeToggle={handleThemeToggle}
        />

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
          <CryptoGrid 
            cryptoData={filteredCryptoData}
            isDark={isDark}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        ) : (
          <CryptoList 
            cryptoData={filteredCryptoData}
            isDark={isDark}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* No Results Message */}
        <NoResultsMessage 
          isDark={isDark}
          showOnlyFavorites={showOnlyFavorites}
          searchQuery={searchQuery}
          tickerSearch={tickerSearch}
          hasFilters={Boolean((searchQuery || tickerSearch || currentFilter !== 'default' || showOnlyFavorites) && filteredCryptoData.length === 0)}
        />
      </div>
    </div>
  );
}
