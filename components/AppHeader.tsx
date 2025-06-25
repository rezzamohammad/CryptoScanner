import { Zap } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface AppHeaderProps {
  isDark: boolean;
  connectionStatus: string;
  lastUpdateTime: Date | null;
  onThemeToggle: () => void;
}

export function AppHeader({ isDark, connectionStatus, lastUpdateTime, onThemeToggle }: AppHeaderProps) {
  return (
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
        </div>
        <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
      </div>
    </div>
  );
}