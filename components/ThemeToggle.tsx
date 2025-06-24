'use client';

import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex items-center w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-emerald-500 ${
        isDark 
          ? 'bg-gray-800 border border-gray-700/25 hover:border-emerald-500/15' 
          : 'bg-gray-300 border border-gray-400/25 hover:border-emerald-500/15'
      }`}
      style={{
        boxShadow: isDark 
          ? '0 1px 4px rgba(16, 185, 129, 0.04), 0 0.5px 1.5px rgba(16, 185, 129, 0.025)' 
          : '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
      aria-label="Toggle theme"
    >
      {/* Slider Track Background */}
      <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-gray-900 to-gray-800' 
          : 'bg-gradient-to-r from-gray-200 to-gray-300'
      }`} />
      
      {/* Icons in track */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5">
        {/* Sun Icon (Light Mode) */}
        <Sun className={`w-3.5 h-3.5 transition-all duration-300 ${
          !isDark 
            ? 'text-yellow-500 opacity-100 scale-100' 
            : 'text-gray-500 opacity-50 scale-90'
        }`} />
        
        {/* Moon Icon (Dark Mode) */}
        <Moon className={`w-3.5 h-3.5 transition-all duration-300 ${
          isDark 
            ? 'text-white opacity-100 scale-100' 
            : 'text-gray-400 opacity-50 scale-90'
        }`} />
      </div>
      
      {/* Slider Thumb */}
      <div
        className={`relative w-5 h-5 rounded-full transition-all duration-300 transform ${
          isDark 
            ? 'translate-x-7 bg-white' 
            : 'translate-x-1 bg-white'
        }`}
        style={{
          boxShadow: isDark 
            ? '0 1px 3px rgba(16, 185, 129, 0.1), 0 0 5px rgba(16, 185, 129, 0.075)' 
            : '0 2px 4px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Inner glow for dark mode */}
        {isDark && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/10 to-teal-400/10 animate-pulse" />
        )}
        
        {/* Active icon on thumb */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isDark ? (
            <Moon className="w-3 h-3 text-gray-700" />
          ) : (
            <Sun className="w-3 h-3 text-yellow-600" />
          )}
        </div>
      </div>
    </button>
  );
}