import { Star } from 'lucide-react';
import { CryptoListItem } from './CryptoListItem';
import { type FrontendCryptoData } from '@/lib/dataTransformers';

interface CryptoListProps {
  cryptoData: FrontendCryptoData[];
  isDark: boolean;
  favorites: Set<string>;
  onToggleFavorite: (symbol: string) => void;
}

export function CryptoList({ cryptoData, isDark, favorites, onToggleFavorite }: CryptoListProps) {
  return (
    <div className="space-y-2">
      {cryptoData.map((crypto) => (
        <div key={crypto.symbol} className="relative">
          {/* Favorite Star for List View */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(crypto.symbol);
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
  );
}