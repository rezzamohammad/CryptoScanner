'use client';

import { Grid3X3, List } from 'lucide-react';

interface ViewToggleProps {
  isDark: boolean;
  currentView: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ViewToggle({ isDark, currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className={`flex items-center rounded-lg p-1 transition-all duration-300 ${
      isDark 
        ? 'bg-gray-800/67 backdrop-blur-sm border border-gray-700/50 neon-green-sm' 
        : 'bg-white/87 backdrop-blur-sm border border-gray-200 neon-green-sm'
    }`}>
      {/* Grid View Button */}
      <button
        onClick={() => onViewChange('grid')}
        className={`flex items-center justify-center p-2 rounded-md transition-all duration-300 ${
          currentView === 'grid'
            ? 'bg-emerald-500 text-white neon-green-sm'
            : isDark
              ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        aria-label="Grid view"
      >
        <Grid3X3 className="w-4 h-4" />
      </button>

      {/* List View Button */}
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center justify-center p-2 rounded-md transition-all duration-300 ${
          currentView === 'list'
            ? 'bg-emerald-500 text-white neon-green-sm'
            : isDark
              ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}