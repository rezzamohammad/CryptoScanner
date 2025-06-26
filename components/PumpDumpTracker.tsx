'use client';

import { TrendingUp, TrendingDown, Clock, Pin, ChevronDown, ChevronUp, Settings, Star, Sparkles, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { AIStrategyModal } from './AIStrategyModal';

interface PumpDumpEvent {
  id: string;
  symbol: string;
  name: string;
  type: 'PUMP' | 'DUMP';
  price: number;
  change: number;
  volume: string;
  timestamp: Date;
  detectionTime: string;
  isPinned?: boolean;
}

interface PumpDumpTrackerProps {
  isDark: boolean;
  cryptoData: any[];
}

export function PumpDumpTracker({ isDark, cryptoData }: PumpDumpTrackerProps) {
  const [pinnedEvents, setPinnedEvents] = useState<PumpDumpEvent[]>([]);
  const [recentEvents, setRecentEvents] = useState<PumpDumpEvent[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [maxEvents, setMaxEvents] = useState(5);
  const [inputValue, setInputValue] = useState('5');
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('');

  // State to track if component data has been loaded from localStorage
  const [isStateLoaded, setIsStateLoaded] = useState(false);

  // Load component state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('crypto-pump-dump-tracker-state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);

        // Validate and apply saved state
        if (typeof state.isExpanded === 'boolean') setIsExpanded(state.isExpanded);
        if (typeof state.showSettings === 'boolean') setShowSettings(state.showSettings);
        if (typeof state.maxEvents === 'number' && state.maxEvents >= 1 && state.maxEvents <= 50) {
          setMaxEvents(state.maxEvents);
          setInputValue(state.maxEvents.toString());
        }

        console.log('📋 Loaded PumpDumpTracker state from localStorage:', state);
      } catch (error) {
        console.error('❌ Error loading PumpDumpTracker state:', error);
      }
    } else {
      console.log('📋 No saved PumpDumpTracker state found, using defaults');
    }

    // Mark state as loaded
    setIsStateLoaded(true);
  }, []);

  // Save component state to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    // Only save after state has been loaded to prevent overwriting with defaults
    if (!isStateLoaded) return;

    const state = { isExpanded, showSettings, maxEvents };

    try {
      localStorage.setItem('crypto-pump-dump-tracker-state', JSON.stringify(state));
      console.log('💾 Saved PumpDumpTracker state to localStorage:', state);
    } catch (error) {
      console.error('❌ Error saving PumpDumpTracker state:', error);
    }
  }, [isExpanded, showSettings, maxEvents, isStateLoaded]);

  // Stable ID generator and event tracking
  const stableIdGenerator = useRef(new Map<string, string>());
  const lastProcessedSignals = useRef(new Map<string, { signal: string; timestamp: number }>());

  // Enhanced event detection with proper signal change tracking
  const newEventsDetected = useMemo(() => {
    if (!cryptoData || cryptoData.length === 0) return [];

    const newEvents: PumpDumpEvent[] = [];

    cryptoData.forEach(crypto => {
      if (crypto.signal === 'PUMP' || crypto.signal === 'DUMP') {
        const currentTime = Date.now();
        const lastSignal = lastProcessedSignals.current.get(crypto.symbol);

        // Check if this is a new signal or signal change
        const isNewEvent = !lastSignal ||
                          lastSignal.signal !== crypto.signal ||
                          (currentTime - lastSignal.timestamp) > 60000; // 1 minute threshold

        if (isNewEvent) {
          const detectionTime = crypto.detectionTime || new Date();
          const key = `${crypto.symbol}-${crypto.signal}-${detectionTime.getTime()}`;

          // Generate stable ID for this specific event
          if (!stableIdGenerator.current.has(key)) {
            stableIdGenerator.current.set(key, `${crypto.symbol}-${crypto.signal}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
          }

          const event: PumpDumpEvent = {
            id: stableIdGenerator.current.get(key)!,
            symbol: crypto.symbol,
            name: crypto.name,
            type: crypto.signal as 'PUMP' | 'DUMP',
            price: crypto.price,
            change: crypto.change ?? 0,
            volume: crypto.volume,
            timestamp: detectionTime,
            detectionTime: format(detectionTime, 'HH:mm'),
            isPinned: false
          };

          newEvents.push(event);

          // Update the last processed signal
          lastProcessedSignals.current.set(crypto.symbol, {
            signal: crypto.signal,
            timestamp: currentTime
          });

          console.log(`🚨 New ${crypto.signal} event detected for ${crypto.symbol}`);
        }
      }
    });

    return newEvents;
  }, [cryptoData]);

  // Enhanced event management with persistence and proper FIFO queue behavior
  useEffect(() => {
    if (!isStateLoaded) return; // Wait for component state to load

    // Process new events when they are detected
    if (newEventsDetected.length > 0) {
      setRecentEvents(prevEvents => {
        // Create a map of existing events by their stable ID to prevent duplicates
        const existingEventsMap = new Map(prevEvents.map(event => [event.id, event]));

        // Add new events that don't already exist
        const newEvents = newEventsDetected.filter((event: PumpDumpEvent) => !existingEventsMap.has(event.id));

        if (newEvents.length > 0) {
          console.log(`📊 PumpDumpTracker: Adding ${newEvents.length} new events`);

          // Combine existing events with new events
          const combinedEvents = [...prevEvents, ...newEvents];

          // Sort by timestamp (newest first) and apply FIFO queue behavior
          const sortedEvents = combinedEvents
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, maxEvents); // Keep only the most recent maxEvents

          console.log(`📊 PumpDumpTracker: Updated events list (${sortedEvents.length}/${maxEvents})`);
          return sortedEvents;
        }

        return prevEvents; // No new events, return existing
      });
    }
  }, [newEventsDetected, maxEvents, isStateLoaded]);

  // Handle maxEvents changes - trim existing events when limit is reduced
  useEffect(() => {
    if (!isStateLoaded) return;

    setRecentEvents(prevEvents => {
      if (prevEvents.length > maxEvents) {
        const trimmedEvents = prevEvents
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, maxEvents);
        console.log(`📊 PumpDumpTracker: Trimmed events list from ${prevEvents.length} to ${trimmedEvents.length}`);
        return trimmedEvents;
      }
      return prevEvents;
    });
  }, [maxEvents, isStateLoaded]);

  // Handle slider change
  const handleSliderChange = (value: number) => {
    setMaxEvents(value);
    setInputValue(value.toString());
  };

  // Handle manual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 50) {
      setMaxEvents(numValue);
    }
  };

  // Handle input blur to validate and correct
  const handleInputBlur = () => {
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < 1) {
      setMaxEvents(1);
      setInputValue('1');
    } else if (numValue > 50) {
      setMaxEvents(50);
      setInputValue('50');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 4 : 2,
    }).format(price);
  };

  const getEventShadowClasses = (type: 'PUMP' | 'DUMP') => {
    return type === 'PUMP' ? 'neon-green-sm' : 'neon-red-sm';
  };

  const getEventBorderClasses = (type: 'PUMP' | 'DUMP', isPinned: boolean = false) => {
    if (isPinned) {
      return type === 'PUMP' 
        ? 'border-l-4 border-l-yellow-500' 
        : 'border-l-4 border-l-orange-500';
    }
    return type === 'PUMP' 
      ? 'border-l-4 border-l-emerald-500' 
      : 'border-l-4 border-l-red-500';
  };

  const getEventBgClasses = (type: 'PUMP' | 'DUMP', isPinned: boolean = false) => {
    if (isPinned) {
      return type === 'PUMP'
        ? 'bg-gradient-to-r from-yellow-500/5 to-amber-500/5'
        : 'bg-gradient-to-r from-orange-500/5 to-red-500/5';
    }
    return type === 'PUMP'
      ? 'bg-gradient-to-r from-emerald-500/5 to-teal-500/5'
      : 'bg-gradient-to-r from-red-500/5 to-pink-500/5';
  };

  const getSlotNumber = (index: number, isPinnedSection: boolean = false) => {
    if (isPinnedSection) {
      return '★';
    }
    return index + 1;
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Calculate scroll height based on number of events
  const getScrollHeight = () => {
    const totalEvents = pinnedEvents.length + recentEvents.length;
    if (totalEvents <= 5) return 'max-h-none';
    return 'max-h-80'; // Fixed height for scrolling when more than 5 events
  };

  // Event Row Component
  const EventRow = ({
    event,
    index,
    isPinnedSection = false
  }: {
    event: PumpDumpEvent;
    index: number;
    isPinnedSection?: boolean;
  }) => (
    <div
      className={`group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.005] cursor-pointer ${
        isDark 
          ? `bg-gray-800/67 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800/77 ${getEventShadowClasses(event.type)}` 
          : `bg-white/87 backdrop-blur-sm border border-gray-200 hover:bg-white ${getEventShadowClasses(event.type)}`
      } ${getEventBorderClasses(event.type, isPinnedSection)}`}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        getEventBgClasses(event.type, isPinnedSection)
      }`} />
      
      <div className="relative px-3 py-3">
        <div className="flex items-center justify-between w-full">

          {/* Left Section: All text content */}
          <div className="flex items-center flex-1">
            {/* Column 1: Slot Number & Symbol/Name */}
            <div className="flex items-center">
            {/* Slot Number */}
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 ${
              isPinnedSection
                ? event.type === 'PUMP'
                  ? 'bg-yellow-500 text-white neon-teal-sm'
                  : 'bg-orange-500 text-white neon-red-sm'
                : event.type === 'PUMP'
                  ? 'bg-emerald-500 text-white neon-green-sm'
                  : 'bg-red-500 text-white neon-red-sm'
            }`}>
              {getSlotNumber(index, isPinnedSection)}
            </div>
            
            {/* Symbol and Name */}
            <div className="px-3 min-w-[175px]">
              <div className={`text-sm font-bold truncate ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {event.symbol}
              </div>
              <div className={`text-xs truncate ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {event.name}
              </div>
            </div>
          </div>

            {/* Column 2: Price & Volume */}
            <div className="min-w-[100px]">
              <div className={`text-sm font-semibold truncate ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {formatPrice(event.price)}
              </div>
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div>24h Volume</div>
                <div className="font-medium truncate">{event.volume}</div>
              </div>
            </div>

            {/* Column 3: Percentage & Signal */}
            <div className="min-w-[100px]">
              <div className={`flex items-center text-xs font-medium mb-1 ${
                (event.change ?? 0) > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {(event.change ?? 0) > 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1 flex-shrink-0" />
                )}
                <span className="truncate">{(event.change ?? 0) > 0 ? '+' : ''}{(event.change ?? 0).toFixed(2)}%</span>
              </div>
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div>Signal</div>
                <div className={`font-medium truncate ${
                  event.type === 'PUMP' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {event.type}
                </div>
              </div>
            </div>

            {/* Column 4: Detection Time */}
            <div className="min-w-[100px]">
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div>Detected</div>
                <div className="font-medium">{event.detectionTime}</div>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className={`w-3 h-3 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <span className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {getTimeAgo(event.timestamp)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Section: Action Button */}
          <div className="flex-shrink-0 w-[150px]">
            {/* Action Button based on event type */}
            {event.type === 'PUMP' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSymbol(event.symbol);
                  setShowAIModal(true);
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-1.5 neon-green-md hover:neon-green-lg text-xs"
              >
                <Sparkles className="w-3 h-3 flex-shrink-0" />
                <span>AI Strategy Report</span>
              </button>
            )}

            {event.type === 'DUMP' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle DUMP alert action
                }}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-1.5 neon-red-md hover:neon-red-lg text-xs"
              >
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                <span>DUMP Alert</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Component should always be visible - removed the problematic return null logic
  // that was causing the panel to disappear when events were being processed

  const sliderPercentage = ((maxEvents - 1) / (50 - 1)) * 100;
  const totalActiveEvents = pinnedEvents.length + recentEvents.filter(e => !e.isPinned).length;

  return (
    <div className={`rounded-2xl transition-all duration-300 ${
      isDark 
        ? 'bg-gray-800/72 backdrop-blur-sm border border-gray-700/50 neon-green-sm' 
        : 'bg-white/87 backdrop-blur-sm border border-gray-200 neon-green-sm'
    }`}>
      
      {/* Toggle Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 transition-all duration-300 hover:${
          isDark ? 'bg-gray-700/30' : 'bg-gray-50/50'
        } rounded-2xl cursor-pointer`}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center neon-emerald-glow">
              <Pin className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse neon-emerald-pulse"></div>
          </div>
          
          <h2 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Last {maxEvents} event{maxEvents !== 1 ? 's' : ''}
          </h2>

          {isExpanded && (
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium neon-green-sm`}
                style={{ backgroundColor: isDark ? '#1c2129' : '#dadce3', color: isDark ? '#d1d5db' : '#374151' }}>
                {totalActiveEvents} active
              </span>
              {pinnedEvents.length > 0 && (
                <span className={`px-2 py-1 rounded-lg text-xs font-medium neon-teal-sm`}
                  style={{ backgroundColor: isDark ? '#1c2129' : '#dadce3', color: isDark ? '#d1d5db' : '#374151' }}>
                  {pinnedEvents.length} pinned
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Settings Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(!showSettings);
            }}
            className={`p-2 rounded-full transition-all duration-300 neon-green-sm hover:neon-green-md ${
              showSettings ? 'bg-emerald-500 text-white' : ''
            }`}
            style={!showSettings ? { backgroundColor: isDark ? '#1c2129' : '#dadce3' } : {}}
          >
            <Settings className={`w-4 h-4 ${
              showSettings ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-600'
            }`} />
          </button>

          {/* Expand/Collapse Button */}
          <div className={`p-2 rounded-full transition-all duration-300 neon-green-sm`}
            style={{ backgroundColor: isDark ? '#1c2129' : '#dadce3' }}>
            {isExpanded ? (
              <ChevronUp className={`w-5 h-5 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`} />
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && isExpanded && (
        <div className={`px-6 py-4 mb-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-base font-semibold mb-3 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Event Tracking Settings
          </h3>
          
          <div className="space-y-4">
            {/* Slider and Input Control - Horizontal Layout */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Maximum Events to Track
                </label>
                <span className={`text-sm font-bold ${
                  isDark ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  {maxEvents} event{maxEvents !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Horizontal Layout: Slider + Input */}
              <div className="flex items-center space-x-4">
                {/* Slider - Takes most of the width */}
                <div className="flex-1">
                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={maxEvents}
                    onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                  />

                  <style jsx>{`
                    .slider {
                      background: linear-gradient(to right,
                        #10b981 0%,
                        #10b981 ${sliderPercentage}%,
                        ${isDark ? '#374151' : '#d1d5db'} ${sliderPercentage}%,
                        ${isDark ? '#374151' : '#d1d5db'} 100%
                      );
                      height: 8px;
                      border-radius: 6px;
                      outline: none;
                    }

                    .slider:focus {
                      outline: none;
                      box-shadow: 0 0 0 3px ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)'};
                    }

                    /* WebKit Browsers (Chrome, Safari, Edge) */
                    .slider::-webkit-slider-thumb {
                      appearance: none;
                      height: 20px;
                      width: 20px;
                      border-radius: 50%;
                      background: #10b981;
                      cursor: pointer;
                      border: ${isDark ? '2px solid #1f2937' : '2px solid #ffffff'};
                      box-shadow: ${isDark
                        ? '0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.2)'
                        : '0 2px 6px rgba(16, 185, 129, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)'
                      };
                      transition: all 0.15s ease-in-out;
                    }

                    .slider::-webkit-slider-thumb:hover {
                      background: #059669;
                      box-shadow: ${isDark
                        ? '0 3px 12px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(16, 185, 129, 0.3)'
                        : '0 3px 8px rgba(16, 185, 129, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1)'
                      };
                      transform: scale(1.05);
                    }

                    .slider::-webkit-slider-thumb:active {
                      background: #047857;
                      box-shadow: ${isDark
                        ? '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 0 3px rgba(16, 185, 129, 0.4)'
                        : '0 4px 10px rgba(16, 185, 129, 0.5), 0 2px 6px rgba(0, 0, 0, 0.15)'
                      };
                      transform: scale(1.1);
                    }

                    /* Firefox */
                    .slider::-moz-range-thumb {
                      height: 20px;
                      width: 20px;
                      border-radius: 50%;
                      background: #10b981;
                      cursor: pointer;
                      border: ${isDark ? '2px solid #1f2937' : '2px solid #ffffff'};
                      box-shadow: ${isDark
                        ? '0 2px 8px rgba(0, 0, 0, 0.4)'
                        : '0 2px 6px rgba(16, 185, 129, 0.3)'
                      };
                      transition: all 0.15s ease-in-out;
                    }

                    .slider::-moz-range-thumb:hover {
                      background: #059669;
                      box-shadow: ${isDark
                        ? '0 3px 12px rgba(0, 0, 0, 0.5)'
                        : '0 3px 8px rgba(16, 185, 129, 0.4)'
                      };
                      transform: scale(1.05);
                    }

                    .slider::-moz-range-thumb:active {
                      background: #047857;
                      box-shadow: ${isDark
                        ? '0 4px 16px rgba(0, 0, 0, 0.6)'
                        : '0 4px 10px rgba(16, 185, 129, 0.5)'
                      };
                      transform: scale(1.1);
                    }

                    .slider::-moz-range-track {
                      height: 8px;
                      background: transparent;
                      border: none;
                      border-radius: 6px;
                    }

                    .slider::-moz-range-progress {
                      background: #10b981;
                      height: 8px;
                      border-radius: 6px;
                    }
                  `}</style>
                </div>

                {/* Manual Input - Fixed width on the right */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <label className={`text-sm font-medium whitespace-nowrap ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Or enter:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={inputValue}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className={`w-16 px-2 py-1 rounded-lg border text-sm font-medium transition-all duration-300 text-center ${
                        isDark 
                          ? 'border-gray-600 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      }`}
                      style={{
                        backgroundColor: isDark ? '#000208' : '#ffffff'
                      }}
                    />
                  </div>
                  <span className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    (1-50)
                  </span>
                </div>
              </div>
            </div>

            {/* Info Text */}
            <p className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {maxEvents > 5 
                ? `Tracking ${maxEvents} events with scrollable view for better performance.`
                : `Tracking ${maxEvents} event${maxEvents !== 1 ? 's' : ''} in compact view.`
              }
              {pinnedEvents.length > 0 && ` Pinned events are saved separately and always visible.`}
            </p>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-6">
          {/* Scrollable Container */}
          <div className={`space-y-2 ${getScrollHeight()} ${
            (pinnedEvents.length + recentEvents.filter(e => !e.isPinned).length) > 5 ? 'overflow-y-auto pr-2 custom-scrollbar' : ''
          }`}>
            
            {/* Pinned Events Section */}
            {pinnedEvents.length > 0 && (
              <>
                <div className={`text-sm font-semibold mb-2 flex items-center space-x-2 ${
                  isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  <Star className="w-4 h-4 fill-current" />
                  <span>Pinned Events</span>
                </div>
                {pinnedEvents.map((event, index) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    index={index}
                    isPinnedSection={true}
                  />
                ))}
                
                {/* Divider between pinned and recent */}
                {recentEvents.filter(e => !e.isPinned).length > 0 && (
                  <div className={`border-t my-4 ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`} />
                )}
              </>
            )}

            {/* Recent Events Section */}
            {recentEvents.filter(e => !e.isPinned).length > 0 && (
              <>
                {pinnedEvents.length > 0 && (
                  <div className={`text-sm font-semibold mb-2 flex items-center space-x-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span>Recent Events</span>
                  </div>
                )}
                {recentEvents
                  .filter(event => !event.isPinned)
                  .map((event, index) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      index={index}
                      isPinnedSection={false}
                    />
                  ))}
              </>
            )}

            {/* Empty State - Show when no events are available */}
            {pinnedEvents.length === 0 && recentEvents.length === 0 && (
              <div className={`text-center py-8 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-100'
                }`}>
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className={`text-lg font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  No Events Detected
                </h3>
                <p className="text-sm">
                  Pump and dump events will appear here when detected.
                  <br />
                  The tracker is actively monitoring {cryptoData?.length || 0} cryptocurrencies.
                </p>
              </div>
            )}
          </div>

          {/* Scroll Indicator */}
          {(pinnedEvents.length + recentEvents.filter(e => !e.isPinned).length) > 5 && (
            <div className={`mt-3 text-center text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Showing {pinnedEvents.length + recentEvents.filter(e => !e.isPinned).length} events • Scroll to view all
            </div>
          )}
        </div>
      </div>

      {/* AI Strategy Modal */}
      <AIStrategyModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        symbol={selectedSymbol}
        isDark={isDark}
      />
    </div>
  );
}