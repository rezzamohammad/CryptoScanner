'use client';

import { ChevronDown, Filter, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
import { useState } from 'react';

interface FilterDropdownProps {
  isDark: boolean;
  onFilterChange: (filterType: string) => void;
  currentFilter: string;
}

export function FilterDropdown({ isDark, onFilterChange, currentFilter }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filterOptions = [
    { 
      id: 'name-asc', 
      label: 'Name (A-Z)', 
      icon: ArrowUp,
      description: 'Alphabetical order',
      signalType: 'neutral'
    },
    { 
      id: 'name-desc', 
      label: 'Name (Z-A)', 
      icon: ArrowDown,
      description: 'Reverse alphabetical',
      signalType: 'neutral'
    },
    { 
      id: 'volume-desc', 
      label: 'Volume (High to Low)', 
      icon: TrendingUp,
      description: 'Highest volume first',
      signalType: 'neutral'
    },
    { 
      id: 'volume-asc', 
      label: 'Volume (Low to High)', 
      icon: TrendingDown,
      description: 'Lowest volume first',
      signalType: 'neutral'
    },
    { 
      id: 'change-desc', 
      label: 'Percent Up (High to Low)', 
      icon: TrendingUp,
      description: 'Biggest gainers first',
      signalType: 'pump'
    },
    { 
      id: 'change-asc', 
      label: 'Percent Down (High to Low)', 
      icon: TrendingDown,
      description: 'Biggest losers first',
      signalType: 'dump'
    },
    { 
      id: 'signal-pump', 
      label: 'PUMP Signals Only', 
      icon: TrendingUp,
      description: 'Show only pump signals',
      signalType: 'pump'
    },
    { 
      id: 'signal-neutral', 
      label: 'NEUTRAL Signals Only', 
      icon: Minus,
      description: 'Show only neutral signals',
      signalType: 'neutral'
    },
    { 
      id: 'signal-dump', 
      label: 'DUMP Signals Only', 
      icon: TrendingDown,
      description: 'Show only dump signals',
      signalType: 'dump'
    },
    { 
      id: 'detection-latest', 
      label: 'Latest Detection', 
      icon: Clock,
      description: 'Most recently detected',
      signalType: 'neutral'
    },
    { 
      id: 'detection-oldest', 
      label: 'Oldest Detection', 
      icon: Clock,
      description: 'Earliest detected',
      signalType: 'neutral'
    }
  ];

  const getCurrentFilterLabel = () => {
    const filter = filterOptions.find(option => option.id === currentFilter);
    return filter ? filter.label : 'Sort & Filter';
  };

  const handleFilterSelect = (filterId: string) => {
    onFilterChange(filterId);
    setIsOpen(false);
  };

  const getOptionShadowClasses = (option: any, isSelected: boolean) => {
    if (!isSelected) return '';
    
    switch (option.signalType) {
      case 'pump':
        return 'neon-green-sm';
      case 'dump':
        return 'neon-red-sm';
      default:
        return 'neon-green-sm';
    }
  };

  const getIconBgClasses = (option: any, isSelected: boolean) => {
    if (isSelected) {
      switch (option.signalType) {
        case 'pump':
          return 'bg-emerald-500 text-white neon-green-sm';
        case 'dump':
          return 'bg-red-500 text-white neon-red-sm';
        default:
          return 'bg-emerald-500 text-white neon-green-sm';
      }
    }
    return isDark ? 'text-gray-300' : 'text-gray-600';
  };

  const getTextColor = (option: any, isSelected: boolean) => {
    if (isSelected) {
      switch (option.signalType) {
        case 'pump':
          return 'text-emerald-400';
        case 'dump':
          return 'text-red-400';
        default:
          return 'text-emerald-400';
      }
    }
    return isDark ? 'text-white' : 'text-gray-900';
  };

  const getPulseClasses = (option: any, isSelected: boolean) => {
    if (!isSelected) return '';
    
    switch (option.signalType) {
      case 'pump':
        return 'bg-emerald-500 neon-emerald-pulse';
      case 'dump':
        return 'bg-red-500 neon-red-pulse';
      default:
        return 'bg-emerald-500 neon-emerald-pulse';
    }
  };

  return (
    <div className="relative">
      {/* Filter Button - Matching search box height */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
          isDark 
            ? 'bg-gray-800/72 backdrop-blur-sm border border-gray-700/50 text-white hover:bg-gray-800/77 neon-green-sm hover:neon-green-md' 
            : 'bg-white/87 backdrop-blur-sm border border-gray-200 text-gray-900 hover:bg-gray-50 neon-green-sm hover:neon-green-md'
        } ${
          isOpen 
            ? isDark 
              ? 'border-emerald-500/50 neon-green-lg' 
              : 'border-emerald-500/50 neon-green-md'
            : ''
        }`}
      >
        <Filter className="w-4 h-4 flex-shrink-0" style={{
          filter: isOpen ? 'drop-shadow(0 0 2px rgba(16, 185, 129, 0.39))' : 'none'
        }} />
        <span className="text-sm">
          {currentFilter === 'default' ? 'Sort & Filter' : 'Filtered'}
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className={`absolute top-full right-0 mt-2 w-80 rounded-2xl z-20 ${
            isDark 
              ? 'bg-gray-800/72 border border-gray-700 neon-green-lg' 
              : 'bg-white/87 border border-gray-200 neon-green-md'
          } backdrop-blur-sm`}>
            
            {/* Header */}
            <div className={`p-4 border-b ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Sort & Filter Options
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Choose how to organize your crypto data
              </p>
            </div>

            {/* Filter Options */}
            <div className="max-h-96 overflow-y-auto">
              {filterOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = currentFilter === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleFilterSelect(option.id)}
                    className={`w-full flex items-center space-x-3 p-4 transition-all duration-200 ${
                      isSelected
                        ? isDark
                          ? `border-l-4 ${
                              option.signalType === 'dump' ? 'border-l-red-500' : 'border-l-emerald-500'
                            } ${getOptionShadowClasses(option, isSelected)}`
                          : `border-l-4 ${
                              option.signalType === 'dump' ? 'border-l-red-500' : 'border-l-emerald-500'
                            }`
                        : 'hover:neon-green-sm'
                    }`}
                    style={isSelected ? { backgroundColor: isDark ? '#1c2129' : '#dadce3' } : { backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = isDark ? '#1c2129' : '#dadce3';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      getIconBgClasses(option, isSelected)
                    }`}
                    style={!isSelected ? { backgroundColor: isDark ? '#1c2129' : '#dadce3' } : {}}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${
                        getTextColor(option, isSelected)
                      }`}>
                        {option.label}
                      </div>
                      <div className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {option.description}
                      </div>
                    </div>

                    {isSelected && (
                      <div className={`w-2 h-2 rounded-full ${
                        getPulseClasses(option, isSelected)
                      }`}></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className={`p-4 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => {
                  onFilterChange('default');
                  setIsOpen(false);
                }}
                className={`w-full py-2 px-4 rounded-xl font-medium transition-all duration-300 text-white neon-green-sm hover:neon-green-md`}
                style={{ 
                  backgroundColor: isDark ? '#1c2129' : '#dadce3',
                  color: isDark ? '#ffffff' : '#374151'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#1c2129' : '#c4c7d0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#1c2129' : '#dadce3';
                }}
              >
                Reset to Default
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}