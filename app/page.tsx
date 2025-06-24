'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Zap, Star } from 'lucide-react';
import { ApiClient, wsClient } from '@/lib/apiClient';
import { transformBackendData, mapSettingsToBackend, type FrontendCryptoData } from '@/lib/dataTransformers';
import { handleApiError, retryWithBackoff, logError } from '@/lib/errorHandling';
import { useTheme } from '@/hooks/useTheme';
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
  const [detectionModel, setDetectionModel] = useState('Logarithmic');
  const [priceSensitivity, setPriceSensitivity] = useState(0.9);
  const [volumeSensitivity, setVolumeSensitivity] = useState(1.5);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState('default');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');

  // New state for crypto display features
  const [displayCount, setDisplayCount] = useState(25);
  const [tickerSearch, setTickerSearch] = useState('');
  const [sortOption, setSortOption] = useState('volume-desc');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // State to track if localStorage data has been loaded
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Settings synchronization state management
  const [settingsState, setSettingsState] = useState({
    isLoading: false,
    isSyncing: false,
    lastSyncTime: null as number | null,
    pendingChanges: false,
    syncRetryCount: 0,
    maxRetries: 3
  });

  // API Data State
  const [cryptoData, setCryptoData] = useState<FrontendCryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Backend Settings State
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Theme management is now handled by useTheme hook

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('crypto-favorites');
    if (savedFavorites) {
      try {
        const favArray = JSON.parse(savedFavorites);
        setFavorites(new Set(favArray));
        console.log('⭐ Loaded favorites from localStorage:', favArray);
      } catch (error) {
        console.error('❌ Error loading favorites:', error);
      }
    } else {
      console.log('⭐ No saved favorites found, using empty set');
    }

    // Mark favorites as loaded
    setIsDataLoaded(true);
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    // Skip saving on initial load to prevent overwriting with empty set
    if (favorites.size > 0 || isThemeLoaded) {
      localStorage.setItem('crypto-favorites', JSON.stringify(Array.from(favorites)));
      console.log('💾 Saved favorites to localStorage:', Array.from(favorites));
    }
  }, [favorites, isThemeLoaded]);

  // Load detection settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('crypto-detection-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.detectionModel) setDetectionModel(settings.detectionModel);
        if (typeof settings.priceSensitivity === 'number') setPriceSensitivity(settings.priceSensitivity);
        if (typeof settings.volumeSensitivity === 'number') setVolumeSensitivity(settings.volumeSensitivity);
        console.log('📋 Loaded detection settings from localStorage:', settings);
      } catch (error) {
        console.error('❌ Error loading detection settings:', error);
      }
    } else {
      console.log('📋 No saved detection settings found, using defaults');
    }
  }, []);

  // Save detection settings to localStorage whenever they change
  useEffect(() => {
    // Skip saving on initial load (when isThemeLoaded is false)
    if (!isThemeLoaded) return;

    const settings = {
      detectionModel,
      priceSensitivity,
      volumeSensitivity
    };
    localStorage.setItem('crypto-detection-settings', JSON.stringify(settings));
    console.log('💾 Saved detection settings to localStorage:', settings);
  }, [detectionModel, priceSensitivity, volumeSensitivity, isThemeLoaded]);

  // Load display preferences from localStorage on mount
  useEffect(() => {
    const savedDisplaySettings = localStorage.getItem('crypto-display-settings');
    if (savedDisplaySettings) {
      try {
        const settings = JSON.parse(savedDisplaySettings);
        if (settings.currentView) setCurrentView(settings.currentView);
        if (typeof settings.displayCount === 'number') setDisplayCount(settings.displayCount);
        if (typeof settings.tickerSearch === 'string') setTickerSearch(settings.tickerSearch);
        if (settings.sortOption) setSortOption(settings.sortOption);

        // CRITICAL FIX: Only restore showOnlyFavorites if we have favorites loaded
        // This prevents the race condition where showOnlyFavorites=true but favorites is empty
        if (typeof settings.showOnlyFavorites === 'boolean') {
          if (!settings.showOnlyFavorites) {
            // Always restore false state immediately
            setShowOnlyFavorites(false);
          }
          // For true state, we'll handle it after favorites are loaded
        }

        console.log('📋 Loaded display settings from localStorage:', settings);
      } catch (error) {
        console.error('❌ Error loading display settings:', error);
      }
    } else {
      console.log('📋 No saved display settings found, using defaults');
    }
  }, []);

  // Restore showOnlyFavorites after favorites are loaded
  useEffect(() => {
    if (isDataLoaded) {
      const savedDisplaySettings = localStorage.getItem('crypto-display-settings');
      if (savedDisplaySettings) {
        try {
          const settings = JSON.parse(savedDisplaySettings);
          if (typeof settings.showOnlyFavorites === 'boolean' && settings.showOnlyFavorites) {
            // Only restore true state if we have favorites
            if (favorites.size > 0) {
              setShowOnlyFavorites(true);
              console.log('⭐ Restored showOnlyFavorites after favorites loaded: true');
            } else {
              console.log('⭐ Not restoring showOnlyFavorites=true because no favorites exist');
            }
          }
        } catch (error) {
          console.error('❌ Error restoring showOnlyFavorites:', error);
        }
      }
    }
  }, [isDataLoaded, favorites.size]);

  // Save display preferences to localStorage whenever they change
  useEffect(() => {
    // Skip saving on initial load (when isThemeLoaded is false)
    if (!isThemeLoaded) return;

    const settings = {
      currentView,
      displayCount,
      tickerSearch,
      sortOption,
      showOnlyFavorites
    };
    localStorage.setItem('crypto-display-settings', JSON.stringify(settings));
    console.log('💾 Saved display settings to localStorage:', settings);
  }, [currentView, displayCount, tickerSearch, sortOption, showOnlyFavorites, isThemeLoaded]);

  // API Data Fetching - Initial Load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if backend API is enabled
        const useBackendApi = process.env.NEXT_PUBLIC_ENABLE_BACKEND_API === 'true';

        if (useBackendApi) {
          console.log('🔄 Fetching initial data from backend API...');

          // Fetch market data with retry logic
          const response = await retryWithBackoff(
            () => ApiClient.getTickers({ limit: 100, sortBy: 'signal' }),
            3,
            (attempt, error) => {
              console.log(`⚠️ API attempt ${attempt} failed:`, error.message);
            }
          );

          if (response.success && response.data) {
            const transformedData = transformBackendData(response.data);
            setCryptoData(transformedData);
            setLastUpdateTime(new Date());
            setConnectionStatus('connected');
            console.log(`✅ Loaded ${transformedData.length} cryptocurrencies from API`);
          } else {
            throw new Error('Invalid API response format');
          }
        } else {
          // Use mock data fallback
          console.log('📝 Using mock data (backend API disabled)');
          setCryptoData(MOCK_CRYPTO_DATA);
          setConnectionStatus('connected');
        }

      } catch (error) {
        const apiError = handleApiError(error);
        logError(apiError, 'Initial Data Fetch');
        setError(apiError.message);
        setConnectionStatus('disconnected');

        // Fallback to mock data if enabled
        const useMockFallback = process.env.NEXT_PUBLIC_ENABLE_MOCK_FALLBACK === 'true';
        if (useMockFallback) {
          console.log('🔄 Falling back to mock data due to API error');
          setCryptoData(MOCK_CRYPTO_DATA);
          setConnectionStatus('connected');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch data after theme is loaded to prevent hydration issues
    if (isThemeLoaded) {
      fetchInitialData();
    }
  }, [isThemeLoaded]);

  // WebSocket Real-time Updates
  useEffect(() => {
    const useBackendApi = process.env.NEXT_PUBLIC_ENABLE_BACKEND_API === 'true';

    if (!useBackendApi || !isThemeLoaded) {
      return;
    }

    console.log('🔌 Setting up WebSocket connection...');

    // Handle real-time market data updates
    const handleMarketUpdate = (payload: any) => {
      try {
        if (payload.data && Array.isArray(payload.data)) {
          const transformedData = transformBackendData(payload.data);
          setCryptoData(transformedData);
          setLastUpdateTime(new Date());
          setConnectionStatus('connected');

          const debugWs = process.env.NEXT_PUBLIC_DEBUG_WEBSOCKET === 'true';
          if (debugWs) {
            console.log(`📊 WebSocket update: ${transformedData.length} cryptocurrencies`);
          }
        }
      } catch (error) {
        console.error('❌ Error processing WebSocket market update:', error);
      }
    };

    // Handle connection status changes
    const handleConnectionStatus = (payload: any) => {
      if (payload.data?.binanceStatus) {
        setConnectionStatus(payload.data.binanceStatus === 'connected' ? 'connected' : 'disconnected');
      }
    };

    // Handle WebSocket connection events
    const handleConnected = () => {
      console.log('✅ WebSocket connected');
      setConnectionStatus('connected');
    };

    const handleDisconnected = () => {
      console.log('⚠️ WebSocket disconnected');
      setConnectionStatus('disconnected');
    };

    const handleError = (error: any) => {
      console.error('❌ WebSocket error:', error);
      setConnectionStatus('disconnected');
    };

    // Set up WebSocket event listeners
    wsClient.on('market_update', handleMarketUpdate);
    wsClient.on('connection_status', handleConnectionStatus);
    wsClient.on('connected', handleConnected);
    wsClient.on('disconnected', handleDisconnected);
    wsClient.on('error', handleError);

    // Cleanup function
    return () => {
      wsClient.off('market_update', handleMarketUpdate);
      wsClient.off('connection_status', handleConnectionStatus);
      wsClient.off('connected', handleConnected);
      wsClient.off('disconnected', handleDisconnected);
      wsClient.off('error', handleError);
    };
  }, [isThemeLoaded]);

  // Enhanced Settings Synchronization with Race Condition Prevention
  const syncSettings = useCallback(async (settings: {
    detectionModel: string;
    priceSensitivity: number;
    volumeSensitivity: number;
  }) => {
    // Prevent concurrent sync operations
    if (settingsState.isSyncing) {
      console.log('⚠️ Settings sync already in progress, skipping...');
      return;
    }

    setSettingsState(prev => ({ ...prev, isSyncing: true }));
    setSettingsLoading(true);

    try {
      // Step 1: Save to localStorage first (immediate persistence)
      const localSettings = {
        detectionModel: settings.detectionModel,
        priceSensitivity: settings.priceSensitivity,
        volumeSensitivity: settings.volumeSensitivity
      };
      localStorage.setItem('crypto-detection-settings', JSON.stringify(localSettings));
      console.log('💾 Settings saved to localStorage:', localSettings);

      // Step 2: Sync with backend if API is enabled
      const useBackendApi = process.env.NEXT_PUBLIC_ENABLE_BACKEND_API === 'true';
      if (useBackendApi) {
        const backendSettings = mapSettingsToBackend(settings);

        // Update backend settings
        await ApiClient.updateSettings(backendSettings);

        // Update WebSocket subscription with new settings
        wsClient.updateSettings(backendSettings);

        console.log('⚙️ Settings synchronized with backend:', backendSettings);
      }

      // Success: Update sync state
      setSettingsState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: Date.now(),
        pendingChanges: false,
        syncRetryCount: 0
      }));

    } catch (error) {
      const apiError = handleApiError(error);
      logError(apiError, 'Settings Sync');
      console.error('❌ Failed to sync settings with backend:', apiError.message);

      // Handle sync failure with retry logic
      setSettingsState(prev => {
        const newRetryCount = prev.syncRetryCount + 1;
        const shouldRetry = newRetryCount < prev.maxRetries;

        if (shouldRetry) {
          console.log(`🔄 Scheduling settings sync retry ${newRetryCount}/${prev.maxRetries}`);
          // Schedule retry with exponential backoff
          setTimeout(() => {
            syncSettings(settings);
          }, Math.min(1000 * Math.pow(2, newRetryCount - 1), 10000));
        }

        return {
          ...prev,
          isSyncing: false,
          pendingChanges: !shouldRetry, // Mark as pending if no more retries
          syncRetryCount: newRetryCount
        };
      });
    } finally {
      setSettingsLoading(false);
    }
  }, [settingsState.isSyncing, settingsState.syncRetryCount, settingsState.maxRetries]);

  // Settings change handler with debouncing
  useEffect(() => {
    if (!isThemeLoaded) return;

    // Debounce settings updates to avoid too many sync calls
    const timeoutId = setTimeout(() => {
      syncSettings({
        detectionModel,
        priceSensitivity,
        volumeSensitivity
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [detectionModel, priceSensitivity, volumeSensitivity, isThemeLoaded, syncSettings]);

  // Toggle favorite status
  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(symbol)) {
        newFavorites.delete(symbol);
      } else {
        newFavorites.add(symbol);
      }
      return newFavorites;
    });
  };

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
              settingsLoading={settingsLoading}
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
