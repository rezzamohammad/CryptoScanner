interface NoResultsMessageProps {
  isDark: boolean;
  showOnlyFavorites: boolean;
  searchQuery: string;
  tickerSearch: string;
  hasFilters: boolean;
}

export function NoResultsMessage({ 
  isDark, 
  showOnlyFavorites, 
  searchQuery, 
  tickerSearch, 
  hasFilters 
}: NoResultsMessageProps) {
  if (!hasFilters) return null;

  return (
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
  );
}