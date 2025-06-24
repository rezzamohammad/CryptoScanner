import { useState, useEffect } from 'react';

export interface UseFavoritesReturn {
  favorites: Set<string>;
  isDataLoaded: boolean;
  toggleFavorite: (symbol: string) => void;
  setFavorites: (favorites: Set<string>) => void;
}

export function useFavorites(isThemeLoaded: boolean): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isDataLoaded, setIsDataLoaded] = useState(false);

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

  return {
    favorites,
    isDataLoaded,
    toggleFavorite,
    setFavorites
  };
}