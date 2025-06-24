# Frontend API Integration Plan

## 📋 Executive Summary

This document outlines the comprehensive plan to integrate the existing Next.js frontend with the newly created backend API, replacing mock data with real-time cryptocurrency data from the backend services.

**Current State**: Frontend uses hardcoded mock data (`cryptoData` array in page.tsx)
**Target State**: Frontend consumes real-time data from backend API with WebSocket updates

## 🎯 Objectives

1. **Replace Mock Data**: Remove hardcoded `cryptoData` and fetch from backend API
2. **Real-time Updates**: Implement WebSocket connection for live data streaming
3. **State Management**: Refactor state management to handle API data and loading states
4. **Error Handling**: Add comprehensive error handling for API failures
5. **Performance**: Optimize data fetching and rendering for smooth user experience
6. **Backward Compatibility**: Maintain all existing UI functionality and user experience

## 🔍 Current Frontend Analysis

### Data Flow Architecture (Current)
```
page.tsx (Mock Data) → Components → UI Rendering
     ↓
Static cryptoData array (Lines 14-175)
     ↓
Direct prop passing to components
```

### Key Components Using Data
1. **Main App (page.tsx)** - Central data management and state
2. **CryptoCard** - Individual crypto display in grid view
3. **CryptoListItem** - Individual crypto display in list view
4. **PumpDumpTracker** - Event tracking and pinning system
5. **CryptoDisplayControls** - Filtering, sorting, and display controls
6. **AIStrategyModal** - AI analysis integration

### Current State Management Structure
```typescript
// Theme and UI State
const [isDark, setIsDark] = useState(false);
const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');

// Detection Settings (Lines 181-183)
const [detectionModel, setDetectionModel] = useState('Logarithmic');
const [priceSensitivity, setPriceSensitivity] = useState(0.9);
const [volumeSensitivity, setVolumeSensitivity] = useState(1.5);

// Display Controls (Lines 186-192)
const [displayCount, setDisplayCount] = useState(25);
const [tickerSearch, setTickerSearch] = useState('');
const [sortOption, setSortOption] = useState('signal');
const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
const [favorites, setFavorites] = useState<Set<string>>(new Set());

// Mock Data (Lines 14-175)
const cryptoData = [ /* 162 lines of hardcoded data */ ];
```

## 🏗️ New Architecture Design

### Target Data Flow Architecture
```
Backend API ←→ Frontend API Client ←→ React State ←→ Components ←→ UI
     ↓              ↓                    ↓             ↓
WebSocket      Real-time Updates    Loading States   Error States
Connection     Data Caching         Error Handling   Retry Logic
```

### New State Management Structure
```typescript
// API Data State
const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

// Backend Settings Sync
const [backendSettings, setBackendSettings] = useState<DetectionSettings | null>(null);
const [settingsLoading, setSettingsLoading] = useState(false);

// Existing UI State (unchanged)
const [isDark, setIsDark] = useState(false);
const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
// ... other UI state
```

## 📋 Implementation Tasks

### Phase 1: API Client Setup & Basic Integration (Day 1)

#### Task 1.1: Environment Configuration
- [ ] Create `.env.local` with API endpoints
- [ ] Configure API base URLs for development/production
- [ ] Set up WebSocket connection URLs

#### Task 1.2: API Client Integration
- [ ] Import and configure `ApiClient` in page.tsx
- [ ] Replace mock data initialization with API call
- [ ] Add loading states during initial data fetch
- [ ] Implement basic error handling

#### Task 1.3: Data Structure Mapping
- [ ] Map backend `CryptoData` interface to frontend expectations
- [ ] Update component props to match backend data structure
- [ ] Handle missing or null technical analysis data
- [ ] Ensure backward compatibility with existing components

### Phase 2: Real-time WebSocket Integration (Day 1-2)

#### Task 2.1: WebSocket Connection Setup
- [ ] Initialize WebSocket client in page.tsx
- [ ] Handle connection states (connecting, connected, disconnected)
- [ ] Implement reconnection logic with exponential backoff
- [ ] Add connection status indicator in UI

#### Task 2.2: Real-time Data Updates
- [ ] Subscribe to market data updates via WebSocket
- [ ] Update `cryptoData` state on incoming messages
- [ ] Maintain data consistency during updates
- [ ] Handle partial updates vs full data refreshes

#### Task 2.3: Signal Detection Integration
- [ ] Listen for signal detection events from backend
- [ ] Update PumpDumpTracker with real-time events
- [ ] Maintain event history and pinning functionality
- [ ] Sync signal priorities with backend

### Phase 3: Settings Synchronization (Day 2)

#### Task 3.1: Backend Settings Integration
- [ ] Fetch current detection settings from backend on load
- [ ] Sync frontend sliders with backend values
- [ ] Map frontend sensitivity values to backend format
- [ ] Handle settings loading states

#### Task 3.2: Settings Updates
- [ ] Send settings updates to backend via API
- [ ] Update WebSocket subscription with new settings
- [ ] Provide user feedback on settings changes
- [ ] Handle settings update errors gracefully

#### Task 3.3: Settings Persistence
- [ ] Remove localStorage settings (now handled by backend)
- [ ] Maintain UI state persistence (theme, view preferences)
- [ ] Sync settings across multiple browser tabs/windows

### Phase 4: Advanced Features Integration (Day 2-3)

#### Task 4.1: AI Analysis Integration
- [ ] Update AIStrategyModal to use backend AI service
- [ ] Handle AI analysis loading states
- [ ] Implement AI service availability checks
- [ ] Add fallback for when AI service is unavailable

#### Task 4.2: Enhanced Filtering & Sorting
- [ ] Implement server-side filtering via API parameters
- [ ] Add backend-powered search functionality
- [ ] Optimize sorting with backend support
- [ ] Maintain client-side filtering for responsiveness

#### Task 4.3: Performance Optimizations
- [ ] Implement data caching strategies
- [ ] Add request debouncing for search/filter
- [ ] Optimize re-rendering with React.memo
- [ ] Add virtual scrolling for large datasets

### Phase 5: Error Handling & Polish (Day 3)

#### Task 5.1: Comprehensive Error Handling
- [ ] Add error boundaries for API failures
- [ ] Implement retry mechanisms for failed requests
- [ ] Show user-friendly error messages
- [ ] Add offline detection and handling

#### Task 5.2: Loading States & UX
- [ ] Add skeleton loaders for initial data fetch
- [ ] Implement progressive loading for large datasets
- [ ] Add loading indicators for settings updates
- [ ] Optimize perceived performance

#### Task 5.3: Testing & Validation
- [ ] Test all existing functionality with real data
- [ ] Validate data consistency across components
- [ ] Test error scenarios and recovery
- [ ] Performance testing with large datasets

## 🔄 Data Mapping Strategy

### Backend to Frontend Data Transformation

#### Backend CryptoData Interface
```typescript
interface CryptoData {
  symbol: string;           // "BTCUSDT"
  price: number;           // 50000.00
  priceChangePercent: number; // 2.5
  volume: number;          // 1000000.00
  signal: string;          // "PUMP", "DUMP", "NEUTRAL"
  priceHistory: number[];  // [49000, 49500, 50000]
  ta: TechnicalAnalysis | null;
  lastUpdated: string;     // ISO timestamp
}
```

#### Frontend Expected Interface (Current)
```typescript
interface CryptoCardProps {
  symbol: string;          // "BTC"
  name: string;           // "Bitcoin"
  price: number;          // 50000.00
  change: number;         // 2.5
  volume: string;         // "1.2B"
  signal: string;         // "PUMP"
  chartData: number[];    // [49000, 49500, 50000]
}
```

#### Transformation Logic
```typescript
const transformBackendData = (backendData: CryptoData[]): FrontendCryptoData[] => {
  return backendData.map(crypto => ({
    symbol: crypto.symbol.replace('USDT', ''), // "BTCUSDT" → "BTC"
    name: getCryptoName(crypto.symbol),        // Map symbol to full name
    price: crypto.price,
    change: crypto.priceChangePercent,
    volume: formatVolume(crypto.volume),       // 1000000 → "1.0M"
    signal: crypto.signal,
    chartData: crypto.priceHistory,
    detectionTime: new Date(crypto.lastUpdated),
    ta: crypto.ta
  }));
};
```

## 🚨 Risk Mitigation

### High-Risk Areas
1. **Data Structure Mismatches** - Backend and frontend data formats differ
2. **WebSocket Connection Stability** - Network issues could break real-time updates
3. **Performance Impact** - Real-time updates might cause excessive re-renders
4. **State Management Complexity** - Multiple data sources and loading states

### Mitigation Strategies
1. **Gradual Migration** - Implement API integration incrementally
2. **Fallback Mechanisms** - Keep mock data as fallback during development
3. **Comprehensive Testing** - Test all scenarios including edge cases
4. **Performance Monitoring** - Monitor render performance and optimize

## 📊 Success Metrics

### Technical Metrics
- [ ] API response time < 200ms for market data
- [ ] WebSocket connection uptime > 99%
- [ ] Frontend render time < 100ms after data update
- [ ] Zero data inconsistencies between components

### User Experience Metrics
- [ ] All existing functionality preserved
- [ ] Real-time updates visible within 1 second
- [ ] Smooth transitions between loading states
- [ ] Error recovery without page refresh

### Code Quality Metrics
- [ ] No breaking changes to component interfaces
- [ ] Comprehensive error handling coverage
- [ ] Clean separation of API logic from UI components
- [ ] Maintainable and testable code structure

## 🛠️ Implementation Details

### Critical Code Changes Required

#### 1. page.tsx Main Changes (Lines 14-175, 397-621)
```typescript
// REMOVE: Mock data array (162 lines)
const cryptoData = [ /* ... */ ];

// ADD: API state management
const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// ADD: API data fetching
useEffect(() => {
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const response = await ApiClient.getTickers({ limit: 100 });
      setCryptoData(transformBackendData(response.data));
    } catch (err) {
      setError('Failed to load market data');
    } finally {
      setIsLoading(false);
    }
  };
  fetchInitialData();
}, []);
```

#### 2. WebSocket Integration
```typescript
// ADD: WebSocket connection management
useEffect(() => {
  wsClient.on('market_update', (data) => {
    setCryptoData(transformBackendData(data.data));
  });

  wsClient.on('signal_detected', (data) => {
    // Update PumpDumpTracker with new signals
    updateSignalEvents(data.data);
  });

  return () => {
    wsClient.off('market_update');
    wsClient.off('signal_detected');
  };
}, []);
```

#### 3. Settings Synchronization
```typescript
// ADD: Backend settings sync
const syncSettingsWithBackend = async (settings: DetectionSettings) => {
  try {
    await ApiClient.updateSettings(settings);
    wsClient.updateSettings(settings);
  } catch (error) {
    console.error('Failed to update settings:', error);
  }
};
```

### Component Updates Required

#### 1. CryptoCard.tsx (Lines 8-17)
```typescript
// UPDATE: Props interface to match backend data
interface CryptoCardProps {
  symbol: string;
  name: string;           // Will be derived from symbol
  price: number;
  change: number;         // Maps to priceChangePercent
  volume: string;         // Will be formatted from number
  signal: string;
  chartData: number[];    // Maps to priceHistory
  isDark: boolean;
  ta?: TechnicalAnalysis; // ADD: Technical analysis data
}
```

#### 2. PumpDumpTracker.tsx (Lines 36-58)
```typescript
// UPDATE: Event generation from real-time data
useEffect(() => {
  const pumpDumpEvents = cryptoData
    .filter(crypto => ['PUMP', 'DUMP', 'STRONG_PUMP'].includes(crypto.signal))
    .map(crypto => ({
      id: `${crypto.symbol}-${crypto.lastUpdated}`,
      symbol: crypto.symbol.replace('USDT', ''),
      name: getCryptoName(crypto.symbol),
      type: crypto.signal.includes('PUMP') ? 'PUMP' : 'DUMP',
      price: crypto.price,
      change: crypto.priceChangePercent,
      volume: formatVolume(crypto.volume),
      timestamp: new Date(crypto.lastUpdated),
      detectionTime: format(new Date(crypto.lastUpdated), 'HH:mm'),
      isPinned: false
    }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxEvents);

  setRecentEvents(pumpDumpEvents);
}, [cryptoData, maxEvents]);
```

### Utility Functions Required

#### 1. Data Transformation Utilities
```typescript
// lib/dataTransformers.ts
export const getCryptoName = (symbol: string): string => {
  const nameMap: Record<string, string> = {
    'BTCUSDT': 'Bitcoin',
    'ETHUSDT': 'Ethereum',
    // ... more mappings
  };
  return nameMap[symbol] || symbol.replace('USDT', '');
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
  return volume.toFixed(2);
};
```

#### 2. Error Handling Utilities
```typescript
// lib/errorHandling.ts
export const handleApiError = (error: any): string => {
  if (error.message?.includes('fetch')) {
    return 'Network connection failed. Please check your internet connection.';
  }
  if (error.message?.includes('503')) {
    return 'Market data service is temporarily unavailable.';
  }
  return 'An unexpected error occurred. Please try again.';
};
```

### Environment Configuration
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3002
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
```

### Testing Strategy

#### 1. Unit Tests
- [ ] API client methods
- [ ] Data transformation functions
- [ ] Error handling utilities
- [ ] WebSocket connection management

#### 2. Integration Tests
- [ ] API data fetching and state updates
- [ ] WebSocket real-time updates
- [ ] Settings synchronization
- [ ] Component rendering with real data

#### 3. E2E Tests
- [ ] Full user workflow with backend
- [ ] Error scenarios and recovery
- [ ] Performance under load
- [ ] Cross-browser compatibility

### Rollback Strategy

#### 1. Feature Flags
```typescript
const USE_BACKEND_API = process.env.NEXT_PUBLIC_ENABLE_BACKEND_API === 'true';

const cryptoData = USE_BACKEND_API
  ? await ApiClient.getTickers()
  : MOCK_CRYPTO_DATA;
```

#### 2. Gradual Migration
- Phase 1: API integration with mock fallback
- Phase 2: WebSocket with polling fallback
- Phase 3: Full backend integration
- Phase 4: Remove mock data entirely

---

**Estimated Timeline**: 3 days for complete integration
**Risk Level**: High (major architectural change)
**Dependencies**: Backend must be running and stable
**Testing Requirements**: Comprehensive testing at each phase

**Next Steps**: Review this detailed plan and approve before beginning implementation. Each phase will have detailed acceptance criteria and testing requirements.
