import { useState, useEffect } from 'react';

export interface DisplaySettings {
  currentView: 'grid' | 'list';
  displayCount: number;
  tickerSearch: string;
  sortOption: string;
  showOnlyFavorites: boolean;
}

export interface UseDisplaySettingsReturn {
  currentView: 'grid' | 'list';
  displayCount: number;
  tickerSearch: string;
  sortOption: string;
  showOnlyFavorites: boolean;
  setCurrentView: (view: 'grid' | 'list') => void;
  setDisplayCount: (count: number) => void;
  setTickerSearch: (search: string) => void;
  setSortOption: (option: string) => void;
  setShowOnlyFavorites: (show: boolean) => void;
}

export function useDisplaySettings(
  isThemeLoaded: boolean,
  isDataLoaded: boolean,
  favoritesSize: number
): UseDisplaySettingsReturn {
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [displayCount, setDisplayCount] = useState(25);
  const [tickerSearch, setTickerSearch] = useState('');
  const [sortOption, setSortOption] = useState('volume-desc');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

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

        console.log('🔧 Loaded display settings from localStorage:', settings);
      } catch (error) {
        console.error('❌ Error loading display settings:', error);
      }
    } else {
      console.log('🔧 No saved display settings found, using defaults');
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
            if (favoritesSize > 0) {
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
  }, [isDataLoaded, favoritesSize]);

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

  return {
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
  };
}