import { useMemo, useEffect } from 'react';
import { type FrontendCryptoData } from '@/lib/dataTransformers';

export interface UseCryptoFilteringReturn {
  filteredCryptoData: FrontendCryptoData[];
  parseVolume: (volume: string) => number;
}

export function useCryptoFiltering(
  cryptoData: FrontendCryptoData[],
  searchQuery: string,
  tickerSearch: string,
  currentFilter: string,
  sortOption: string,
  favorites: Set<string>,
  showOnlyFavorites: boolean,
  displayCount: number,
  isDataLoaded: boolean,
  setShowOnlyFavorites: (show: boolean) => void
): UseCryptoFilteringReturn {

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
        console.warn('⭐ showOnlyFavorites is true but no favorites exist, resetting filter');
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
        filtered.sort((a, b) => (b.change ?? 0) - (a.change ?? 0));
        break;
      case 'change-asc':
        filtered.sort((a, b) => (a.change ?? 0) - (b.change ?? 0));
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
            filtered.sort((a, b) => (b.change ?? 0) - (a.change ?? 0));
            break;
          case 'change-asc':
            filtered.sort((a, b) => (a.change ?? 0) - (b.change ?? 0));
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

  return {
    filteredCryptoData,
    parseVolume
  };
}