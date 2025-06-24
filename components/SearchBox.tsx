'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBoxProps {
  isDark: boolean;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBox({ isDark, onSearch, placeholder = "Search crypto ticker (e.g., BTC, ETH, SOL...)" }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={`relative transition-all duration-300 ${
      isFocused ? 'transform scale-[1.02]' : ''
    }`}>
      <div className={`relative rounded-2xl transition-all duration-300 ${
        isDark 
          ? 'bg-gray-800/67 backdrop-blur-sm border border-gray-700/50 neon-green-sm' 
          : 'bg-white/87 backdrop-blur-sm border border-gray-200 neon-green-sm'
      } ${
        isFocused 
          ? isDark 
            ? 'border-emerald-500/50 neon-green-lg' 
            : 'border-emerald-500/50 neon-green-md'
          : ''
      }`}>
        
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Search className={`w-4 h-4 transition-colors duration-300 ${
            isFocused 
              ? 'text-emerald-500' 
              : isDark ? 'text-gray-400' : 'text-gray-500'
          }`} style={{
            filter: isFocused ? 'drop-shadow(0 0 2px rgba(16, 185, 129, 0.39))' : 'none'
          }} />
        </div>

        {/* Input Field - Reduced padding to match button height */}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 bg-transparent rounded-2xl outline-none transition-all duration-300 ${
            isDark 
              ? 'text-white placeholder-gray-400' 
              : 'text-gray-900 placeholder-gray-500'
          } text-sm font-medium`}
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={clearSearch}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all duration-300 ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white neon-green-sm' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Animated border gradient */}
        {isFocused && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-20 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Search suggestions or recent searches could go here */}
      {query && isFocused && (
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl z-10 ${
          isDark 
            ? 'bg-gray-800/67 border border-gray-700 neon-green-md' 
            : 'bg-white/87 border border-gray-200 neon-green-sm'
        }`}>
          <div className="p-3">
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Searching for "{query}"...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}