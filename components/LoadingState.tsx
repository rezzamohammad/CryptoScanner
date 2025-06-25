import { Zap } from 'lucide-react';

interface LoadingStateProps {
  isDark: boolean;
}

export function LoadingState({ isDark }: LoadingStateProps) {
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