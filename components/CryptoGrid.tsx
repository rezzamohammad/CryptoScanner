import { Star } from 'lucide-react';
import { CryptoCard } from './CryptoCard';
import { type FrontendCryptoData } from '@/lib/dataTransformers';

interface CryptoGridProps {
  cryptoData: FrontendCryptoData[];
  isDark: boolean;
  favorites: Set<string>;
  onToggleFavorite: (symbol: string) => void;
}

export function CryptoGrid({ cryptoData, isDark, favorites, onToggleFavorite }: CryptoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cryptoData.map((crypto) => (
        <div key={crypto.symbol} className="relative">
          {/* Favorite Star Overlay */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(crypto.symbol);
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
  );
}