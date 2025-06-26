# Detailed Refactoring Plan - CryptoScanner Frontend 2025

## Executive Summary

**Current Status**: 75% Complete (Major achievements: app/page.tsx and AIStrategyModal refactored)
**Remaining Work**: 4 components requiring refactoring
**Estimated Effort**: 30-42 hours over 3-4 weeks
**Risk Level**: Low to Medium

## PHASE 1: PumpDumpTracker.tsx Decomposition (Priority P0)

### Current State Analysis
- **File Size**: 809 lines (CRITICAL)
- **Complexity Score**: 8.5/10 (Very High)
- **Main Issues**: 
  - Complex event detection logic mixed with UI (lines 85-150)
  - 150-line nested EventRow component (lines 281-430)
  - Massive inline style block (lines 556-653)
  - Duplicate localStorage patterns

### Refactoring Strategy

#### Task 1.1: Extract EventRow Component (4 hours)
**Objective**: Extract the 150-line nested EventRow into a separate component

**Implementation**:
```typescript
// Create: components/PumpDumpTracker/EventRow.tsx
interface EventRowProps {
  event: PumpDumpEvent;
  index: number;
  isPinnedSection?: boolean;
  isDark: boolean;
  onAIAnalysis: (symbol: string) => void;
  onDumpAlert: (symbol: string) => void;
}

export function EventRow({ event, index, isPinnedSection, isDark, onAIAnalysis, onDumpAlert }: EventRowProps) {
  // Extract lines 281-430 from PumpDumpTracker.tsx
}
```

**Files to Create**:
- `components/PumpDumpTracker/EventRow.tsx` (~150 lines)
- `components/PumpDumpTracker/index.ts` (barrel export)

**Success Criteria**:
- EventRow component < 150 lines
- Clean prop interface
- No inline styles in EventRow
- Maintains all existing functionality

#### Task 1.2: Create useEventDetection Hook (4 hours)
**Objective**: Extract complex event detection logic into a custom hook

**Implementation**:
```typescript
// Create: hooks/useEventDetection.ts
interface UseEventDetectionReturn {
  newEventsDetected: PumpDumpEvent[];
  processNewEvents: () => void;
}

export function useEventDetection(
  cryptoData: any[],
  maxEvents: number
): UseEventDetectionReturn {
  // Extract lines 85-150 from PumpDumpTracker.tsx
  // Include stable ID generation and signal tracking
}
```

**Files to Create**:
- `hooks/useEventDetection.ts` (~100 lines)

**Success Criteria**:
- All event detection logic extracted
- Stable ID generation preserved
- Signal change tracking maintained
- Clean return interface

#### Task 1.3: Create useEventPersistence Hook (2 hours)
**Objective**: Extract localStorage management into reusable hook

**Implementation**:
```typescript
// Create: hooks/useEventPersistence.ts
interface UseEventPersistenceReturn {
  pinnedEvents: PumpDumpEvent[];
  recentEvents: PumpDumpEvent[];
  pinEvent: (event: PumpDumpEvent) => void;
  unpinEvent: (eventId: string) => void;
  clearEvents: () => void;
}

export function useEventPersistence(): UseEventPersistenceReturn {
  // Extract localStorage logic for events
  // Consolidate with existing localStorage patterns
}
```

**Files to Create**:
- `hooks/useEventPersistence.ts` (~80 lines)

**Success Criteria**:
- All localStorage logic extracted
- Consistent with other localStorage hooks
- Error handling included
- Type-safe operations

#### Task 1.4: Convert Inline Styles to CSS Modules (2 hours)
**Objective**: Extract 97-line inline style block to CSS modules

**Implementation**:
```css
/* Create: components/PumpDumpTracker/PumpDumpTracker.module.css */
.slider {
  background: linear-gradient(to right, var(--slider-active), var(--slider-inactive));
  height: 8px;
  border-radius: 6px;
  outline: none;
}

.sliderThumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
}

/* Dark/light theme variables */
[data-theme="dark"] {
  --slider-active: #10b981;
  --slider-inactive: #374151;
  --primary-color: #10b981;
}

[data-theme="light"] {
  --slider-active: #10b981;
  --slider-inactive: #d1d5db;
  --primary-color: #10b981;
}
```

**Files to Create**:
- `components/PumpDumpTracker/PumpDumpTracker.module.css` (~100 lines)

**Success Criteria**:
- Zero inline styles in component
- Theme-aware CSS variables
- Responsive design maintained
- Cross-browser compatibility

#### Task 1.5: Extract Event Filtering Logic (2-4 hours)
**Objective**: Extract event filtering and sorting logic

**Implementation**:
```typescript
// Create: hooks/useEventFiltering.ts
interface UseEventFilteringReturn {
  filteredPinnedEvents: PumpDumpEvent[];
  filteredRecentEvents: PumpDumpEvent[];
  sortEvents: (events: PumpDumpEvent[], sortBy: string) => PumpDumpEvent[];
}

export function useEventFiltering(
  pinnedEvents: PumpDumpEvent[],
  recentEvents: PumpDumpEvent[],
  maxEvents: number,
  filterType?: string
): UseEventFilteringReturn {
  // Extract filtering and sorting logic
}
```

**Files to Create**:
- `hooks/useEventFiltering.ts` (~60 lines)

**Success Criteria**:
- All filtering logic extracted
- Configurable sorting options
- Performance optimized with useMemo
- Clean separation of concerns

### Phase 1 Final Structure
```
components/
├── PumpDumpTracker/
│   ├── index.ts                    # Barrel export
│   ├── PumpDumpTracker.tsx        # Main component (~200 lines)
│   ├── EventRow.tsx               # Event row component (~150 lines)
│   └── PumpDumpTracker.module.css # Styles (~100 lines)
hooks/
├── useEventDetection.ts           # Event detection logic (~100 lines)
├── useEventPersistence.ts         # localStorage management (~80 lines)
└── useEventFiltering.ts           # Filtering logic (~60 lines)
```

**Phase 1 Success Metrics**:
- PumpDumpTracker.tsx: 809 → ~200 lines (75% reduction)
- 3 new focused custom hooks
- 1 extracted component
- Zero inline styles
- All functionality preserved

---

## PHASE 2: CryptoDetailModal.tsx Optimization (Priority P1)

### Current State Analysis
- **File Size**: 491 lines (MEDIUM)
- **Complexity Score**: 6.5/10 (Medium-High)
- **Main Issues**:
  - Chart generation logic mixed with rendering (lines 98-200)
  - Hard-coded pump/dump level calculations
  - Multiple responsibilities in single component

### Refactoring Strategy

#### Task 2.1: Extract Chart Utilities (4 hours)
**Objective**: Extract chart generation logic to utility functions

**Implementation**:
```typescript
// Create: lib/chartUtils.ts
export interface ChartDataPoint {
  time: string;
  price: number;
  volume: number;
}

export interface ChartConfig {
  width: number;
  height: number;
  timeframe: string;
  showVolume: boolean;
}

export function generateExpandedChartData(
  baseData: number[],
  timeframe: string,
  currentPrice: number
): ChartDataPoint[] {
  // Extract lines 98-200 from CryptoDetailModal.tsx
}

export function generateChartConfig(
  timeframe: string,
  containerWidth: number
): ChartConfig {
  // Extract chart configuration logic
}
```

**Files to Create**:
- `lib/chartUtils.ts` (~150 lines)

**Success Criteria**:
- All chart logic extracted
- Configurable chart generation
- Reusable across components
- Type-safe interfaces

#### Task 2.2: Create usePumpDumpLevels Hook (2 hours)
**Objective**: Extract pump/dump level calculations

**Implementation**:
```typescript
// Create: hooks/usePumpDumpLevels.ts
interface PumpDumpLevel {
  level: number;
  type: 'PUMP' | 'DUMP';
  price: number;
  percentage: number;
  probability: number;
  timeEstimate: string;
}

interface UsePumpDumpLevelsReturn {
  pumpLevels: PumpDumpLevel[];
  dumpLevels: PumpDumpLevel[];
  allLevels: PumpDumpLevel[];
}

export function usePumpDumpLevels(
  currentPrice: number,
  signal: string,
  config?: PumpDumpConfig
): UsePumpDumpLevelsReturn {
  // Extract and make configurable the hard-coded calculations
}
```

**Files to Create**:
- `hooks/usePumpDumpLevels.ts` (~80 lines)
- `types/pumpDumpLevels.ts` (~30 lines)

**Success Criteria**:
- Configurable level calculations
- No hard-coded values
- Type-safe interfaces
- Reusable across components

#### Task 2.3: Create Reusable Chart Components (4-6 hours)
**Objective**: Create reusable chart components

**Implementation**:
```typescript
// Create: components/Charts/PriceChart.tsx
interface PriceChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  isDark: boolean;
  onTimeframeChange?: (timeframe: string) => void;
}

export function PriceChart({ data, config, isDark, onTimeframeChange }: PriceChartProps) {
  // Reusable price chart component
}

// Create: components/Charts/VolumeChart.tsx
// Create: components/Charts/ChartContainer.tsx
```

**Files to Create**:
- `components/Charts/PriceChart.tsx` (~100 lines)
- `components/Charts/VolumeChart.tsx` (~80 lines)
- `components/Charts/ChartContainer.tsx` (~60 lines)
- `components/Charts/index.ts` (~20 lines)

**Success Criteria**:
- Reusable chart components
- Consistent styling
- Performance optimized
- Responsive design

### Phase 2 Final Structure
```
components/
├── Charts/
│   ├── index.ts              # Barrel export
│   ├── PriceChart.tsx        # Price chart component (~100 lines)
│   ├── VolumeChart.tsx       # Volume chart component (~80 lines)
│   └── ChartContainer.tsx    # Chart wrapper (~60 lines)
├── CryptoDetailModal.tsx     # Optimized modal (~250 lines)
lib/
├── chartUtils.ts             # Chart utilities (~150 lines)
hooks/
├── usePumpDumpLevels.ts      # Level calculations (~80 lines)
types/
├── pumpDumpLevels.ts         # Type definitions (~30 lines)
```

**Phase 2 Success Metrics**:
- CryptoDetailModal.tsx: 491 → ~250 lines (49% reduction)
- 3 new reusable chart components
- 1 new utility library
- 1 new custom hook
- Configurable calculations

---

## PHASE 3: CryptoDisplayControls.tsx Decomposition (Priority P2)

### Current State Analysis
- **File Size**: 451 lines (MEDIUM)
- **Complexity Score**: 6.0/10 (Medium)
- **Main Issues**:
  - Multiple UI concerns in single component
  - 17 props (too many responsibilities)
  - Duplicate localStorage patterns

### Refactoring Strategy

#### Task 3.1: Split into Sub-components (4 hours)
**Objective**: Split into focused sub-components

**Implementation**:
```typescript
// Create: components/CryptoDisplayControls/DisplayCountControls.tsx
interface DisplayCountControlsProps {
  displayCount: number;
  setDisplayCount: (count: number) => void;
  isDark: boolean;
}

// Create: components/CryptoDisplayControls/SortControls.tsx
interface SortControlsProps {
  sortOption: string;
  setSortOption: (option: string) => void;
  isDark: boolean;
}

// Create: components/CryptoDisplayControls/ViewControls.tsx
interface ViewControlsProps {
  currentView: 'grid' | 'list';
  setCurrentView: (view: 'grid' | 'list') => void;
  isDark: boolean;
}
```

**Files to Create**:
- `components/CryptoDisplayControls/DisplayCountControls.tsx` (~120 lines)
- `components/CryptoDisplayControls/SortControls.tsx` (~100 lines)
- `components/CryptoDisplayControls/ViewControls.tsx` (~80 lines)
- `components/CryptoDisplayControls/index.ts` (~30 lines)

**Success Criteria**:
- Single responsibility per component
- Clean prop interfaces
- Reusable components
- Maintained functionality

#### Task 3.2: Create useLocalStorageState Hook (2 hours)
**Objective**: Create shared localStorage hook

**Implementation**:
```typescript
// Create: hooks/useLocalStorageState.ts
interface UseLocalStorageStateReturn<T> {
  value: T;
  setValue: (value: T) => void;
  isLoaded: boolean;
}

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  validator?: (value: any) => boolean
): UseLocalStorageStateReturn<T> {
  // Consolidate localStorage patterns from multiple components
}
```

**Files to Create**:
- `hooks/useLocalStorageState.ts` (~60 lines)

**Success Criteria**:
- Reusable across all components
- Type-safe operations
- Error handling included
- Validation support

#### Task 3.3: Reduce Prop Drilling (2 hours)
**Objective**: Reduce prop drilling with better state management

**Implementation**:
```typescript
// Create: contexts/DisplaySettingsContext.tsx
interface DisplaySettingsContextValue {
  displayCount: number;
  setDisplayCount: (count: number) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  currentView: 'grid' | 'list';
  setCurrentView: (view: 'grid' | 'list') => void;
  // ... other display settings
}

export function DisplaySettingsProvider({ children }: { children: React.ReactNode }) {
  // Provide display settings context
}
```

**Files to Create**:
- `contexts/DisplaySettingsContext.tsx` (~80 lines)

**Success Criteria**:
- Reduced prop drilling
- Centralized state management
- Type-safe context
- Easy to use hooks

### Phase 3 Final Structure
```
components/
├── CryptoDisplayControls/
│   ├── index.ts                    # Main component (~150 lines)
│   ├── DisplayCountControls.tsx    # Display count (~120 lines)
│   ├── SortControls.tsx           # Sort options (~100 lines)
│   └── ViewControls.tsx           # View toggle (~80 lines)
contexts/
├── DisplaySettingsContext.tsx     # Context provider (~80 lines)
hooks/
├── useLocalStorageState.ts        # Shared localStorage (~60 lines)
```

**Phase 3 Success Metrics**:
- CryptoDisplayControls.tsx: 451 → ~150 lines (67% reduction)
- 3 focused sub-components
- 1 shared localStorage hook
- 1 context provider
- Reduced prop drilling

---

## PHASE 4: API Client Optimization (Priority P3)

### Current State Analysis
- **File Size**: 442 lines (MEDIUM)
- **Complexity Score**: 5.5/10 (Medium)
- **Main Issues**:
  - HTTP and WebSocket clients mixed
  - Complex error handling scattered
  - Missing TypeScript interfaces

### Refactoring Strategy

#### Task 4.1: Split HTTP and WebSocket Clients (3 hours)
**Objective**: Separate HTTP and WebSocket concerns

**Implementation**:
```typescript
// Create: lib/httpClient.ts
export class HttpClient {
  private static baseUrl = API_BASE_URL;
  
  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    // HTTP GET operations
  }
  
  static async post<T>(endpoint: string, data?: any): Promise<T> {
    // HTTP POST operations
  }
}

// Create: lib/wsClient.ts
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  
  connect(options: WebSocketOptions): void {
    // WebSocket connection management
  }
}
```

**Files to Create**:
- `lib/httpClient.ts` (~200 lines)
- `lib/wsClient.ts` (~180 lines)
- `lib/apiClient.ts` (~80 lines) - Updated main export

**Success Criteria**:
- Clean separation of concerns
- Focused responsibilities
- Maintained API compatibility
- Better error handling

#### Task 4.2: Improve TypeScript Interfaces (2 hours)
**Objective**: Add complete TypeScript coverage

**Implementation**:
```typescript
// Create: types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

export interface WebSocketMessage<T> {
  type: string;
  data: T;
  timestamp: string;
}

// Complete interface definitions for all API responses
```

**Files to Create**:
- `types/api.ts` (~100 lines)
- `types/websocket.ts` (~60 lines)

**Success Criteria**:
- 100% TypeScript coverage
- Complete interface definitions
- Type-safe operations
- Better IDE support

#### Task 4.3: Add Request/Response Interceptors (1-2 hours)
**Objective**: Centralize request/response handling

**Implementation**:
```typescript
// Add to httpClient.ts
interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig;
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T>;
  onError?: (error: Error) => Error;
}

export class HttpClient {
  private static interceptors: RequestInterceptor[] = [];
  
  static addInterceptor(interceptor: RequestInterceptor): void {
    // Add interceptor logic
  }
}
```

**Success Criteria**:
- Centralized error handling
- Request/response logging
- Authentication handling
- Retry logic

### Phase 4 Final Structure
```
lib/
├── httpClient.ts          # HTTP client (~200 lines)
├── wsClient.ts           # WebSocket client (~180 lines)
├── apiClient.ts          # Main export (~80 lines)
types/
├── api.ts                # API interfaces (~100 lines)
├── websocket.ts          # WebSocket interfaces (~60 lines)
```

**Phase 4 Success Metrics**:
- apiClient.ts: 442 → ~80 lines (82% reduction)
- 2 focused client libraries
- Complete TypeScript coverage
- Centralized error handling

---

## IMPLEMENTATION TIMELINE

### Week 1: PumpDumpTracker Decomposition
- **Days 1-2**: Extract EventRow component and useEventDetection hook
- **Days 3-4**: Create useEventPersistence hook and convert styles
- **Day 5**: Extract filtering logic and testing

### Week 2: CryptoDetailModal Optimization
- **Days 1-2**: Extract chart utilities and create chart components
- **Days 3-4**: Create usePumpDumpLevels hook and optimize modal
- **Day 5**: Testing and integration

### Week 3: CryptoDisplayControls Decomposition
- **Days 1-2**: Split into sub-components
- **Days 3-4**: Create shared hooks and context
- **Day 5**: Testing and optimization

### Week 4: API Client Optimization & Final Testing
- **Days 1-2**: Split HTTP and WebSocket clients
- **Days 3-4**: Improve TypeScript interfaces and add interceptors
- **Day 5**: Final testing and documentation

## RISK MITIGATION

### Low Risk Tasks
- Component extraction (EventRow, chart components)
- Utility function creation
- CSS modules conversion

### Medium Risk Tasks
- Custom hooks creation (state management changes)
- Context provider implementation
- API client splitting

### High Risk Tasks
- None identified (all major risks resolved in previous phases)

### Mitigation Strategies
1. **Incremental Implementation**: One task at a time
2. **Interface Preservation**: Maintain existing component APIs
3. **Comprehensive Testing**: Test each change thoroughly
4. **Git Commits**: Commit after each completed task
5. **Rollback Plan**: Easy rollback for each phase

## SUCCESS METRICS

### Code Quality Targets
- All components < 300 lines ✓
- Functions < 50 lines: 95%
- Cyclomatic complexity < 10: 100%
- Zero code duplication: 95%
- TypeScript strict mode: 100%

### Performance Targets
- Bundle size reduction: 10-15%
- Render performance: No degradation
- Memory usage: 5-10% reduction
- Load time: 5% improvement

### Maintainability Targets
- Component reusability: 90%
- Test coverage: 80%
- Documentation coverage: 95%
- Developer onboarding time: 60% reduction

## CONCLUSION

This detailed refactoring plan builds upon the successful completion of app/page.tsx and AIStrategyModal refactoring. The remaining work is well-defined, lower risk, and follows established patterns.

**Key Benefits**:
- Improved maintainability and readability
- Better separation of concerns
- Reusable components and hooks
- Enhanced type safety
- Reduced code duplication

**Estimated Completion**: 3-4 weeks with 1 developer
**Overall Project Completion**: 100% (from current 75%)
**Risk Level**: Low to Medium
**ROI**: High (significantly improved codebase quality and maintainability)