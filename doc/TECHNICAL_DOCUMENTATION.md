# CryptoScanner - Technical Documentation

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Architecture](#component-architecture)
3. [State Management](#state-management)
4. [Styling System](#styling-system)
5. [Data Flow](#data-flow)
6. [Performance Optimizations](#performance-optimizations)
7. [Code Organization](#code-organization)
8. [Development Guidelines](#development-guidelines)

## 🏗 Architecture Overview

### Framework Choice: Next.js 14 with App Router

The application uses Next.js 14 with the App Router for several key advantages:

- **Static Site Generation**: Configured for static export (`output: 'export'`)
- **TypeScript Support**: Full TypeScript integration with strict type checking
- **Optimized Bundling**: Automatic code splitting and optimization
- **SEO Ready**: Server-side rendering capabilities (when not using static export)

### Project Configuration

```typescript
// next.config.js
const nextConfig = {
  output: 'export',           // Static site generation
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during builds
  },
  images: { unoptimized: true }, // Disable image optimization for static export
};
```

## 🧩 Component Architecture

### Component Hierarchy

```
App (page.tsx)
├── ControlsPanel
│   ├── Detection Model Selection
│   └── Sensitivity Sliders
├── PumpDumpTracker
│   ├── Event List
│   ├── Pin/Unpin Controls
│   └── Settings Panel
├── CryptoDisplayControls
│   ├── Display Count Slider
│   ├── Ticker Search
│   ├── Favorites Management
│   └── View Toggle
├── SearchBox
├── FilterDropdown
├── ViewToggle
└── Crypto Display
    ├── CryptoCard (Grid View)
    │   ├── AIStrategyModal
    │   └── CryptoDetailModal
    └── CryptoListItem (List View)
        ├── AIStrategyModal
        └── CryptoDetailModal
```

### Component Design Patterns

#### 1. Compound Components
```typescript
// PumpDumpTracker with internal EventRow component
const EventRow = ({ event, onTogglePin, onRemove }) => { ... };

export function PumpDumpTracker() {
  return (
    <div>
      {events.map(event => (
        <EventRow key={event.id} event={event} ... />
      ))}
    </div>
  );
}
```

#### 2. Render Props Pattern
```typescript
// Modal components with flexible content
<AIStrategyModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  symbol={crypto.symbol}
  isDark={isDark}
/>
```

#### 3. Custom Hooks Pattern
```typescript
// Theme management with localStorage persistence
useEffect(() => {
  const savedTheme = localStorage.getItem('crypto-scanner-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
  setIsDark(shouldUseDark);
}, []);
```

## 🔄 State Management

### Local State Strategy

The application uses React's built-in state management with strategic state placement:

#### 1. Global App State (page.tsx)
```typescript
// Theme state
const [isDark, setIsDark] = useState(false);
const [isThemeLoaded, setIsThemeLoaded] = useState(false);

// Detection settings
const [detectionModel, setDetectionModel] = useState('Logarithmic');
const [priceSensitivity, setPriceSensitivity] = useState(0.9);
const [volumeSensitivity, setVolumeSensitivity] = useState(1.5);

// Display settings
const [displayCount, setDisplayCount] = useState(25);
const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
const [favorites, setFavorites] = useState<Set<string>>(new Set());
```

#### 2. Component-Level State
```typescript
// Modal visibility
const [showAIModal, setShowAIModal] = useState(false);
const [showDetailModal, setShowDetailModal] = useState(false);

// UI interactions
const [isExpanded, setIsExpanded] = useState(false);
const [isFocused, setIsFocused] = useState(false);
```

#### 3. Persistent State
```typescript
// Favorites persistence
useEffect(() => {
  localStorage.setItem('crypto-favorites', JSON.stringify(Array.from(favorites)));
}, [favorites]);

// Theme persistence
useEffect(() => {
  if (isDark) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('crypto-scanner-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('crypto-scanner-theme', 'light');
  }
}, [isDark, isThemeLoaded]);
```

## 🎨 Styling System

### Tailwind CSS Configuration

```typescript
// tailwind.config.ts
const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color system with CSS variables
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ... additional colors
      },
    },
  },
};
```

### Custom Neon Effects System

#### CSS Custom Properties
```css
/* globals.css */
@layer utilities {
  .neon-green-sm {
    box-shadow: 0 1.3px 5.2px rgba(16, 185, 129, 0.098), 
                0 0.65px 2px rgba(16, 185, 129, 0.065);
  }
  
  .neon-green-md {
    box-shadow: 0 2.6px 7.8px rgba(16, 185, 129, 0.13), 
                0 1.3px 3.9px rgba(16, 185, 129, 0.098);
  }
  
  /* Additional neon variants... */
}
```

#### Dynamic Styling Functions
```typescript
const getCardShadowClasses = () => {
  if (isDumpSignal) return 'neon-red-sm hover:neon-red-lg';
  if (isPumpSignal) return 'neon-green-sm hover:neon-green-lg';
  return isPositive 
    ? 'neon-green-sm hover:neon-green-lg'
    : 'neon-red-sm hover:neon-red-lg';
};
```

### Responsive Design Strategy

#### Breakpoint System
```typescript
// Grid layout with responsive columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Crypto cards */}
</div>

// Horizontal layout for larger screens
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <PumpDumpTracker />
  <CryptoDisplayControls />
</div>
```

## 📊 Data Flow

### Data Processing Pipeline

#### 1. Static Data Source
```typescript
// Mock data structure
const cryptoData = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 103499.99,
    change: -1.03,
    volume: '1.70B',
    signal: 'NEUTRAL',
    chartData: [104500, 104200, 103800, 103500, 103200, 103499],
    detectionTime: new Date('2025-01-27T09:15:00'),
  },
  // ... more data
];
```

#### 2. Data Transformation
```typescript
// Volume parsing for sorting
const parseVolume = (volume: string) => {
  const num = parseFloat(volume.replace(/[^\d.]/g, ''));
  if (volume.includes('B')) return num * 1000000000;
  if (volume.includes('M')) return num * 1000000;
  if (volume.includes('K')) return num * 1000;
  return num;
};

// Price formatting
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: price < 1 ? 4 : 2,
    maximumFractionDigits: price < 1 ? 4 : 2,
  }).format(price);
};
```

#### 3. Filtering and Sorting Logic
```typescript
const getFilteredAndSortedData = () => {
  let filtered = [...cryptoData];

  // Apply search filters
  if (searchQuery.trim()) {
    filtered = filtered.filter(crypto =>
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply sorting
  switch (sortOption) {
    case 'volume-desc':
      filtered.sort((a, b) => parseVolume(b.volume) - parseVolume(a.volume));
      break;
    case 'change-desc':
      filtered.sort((a, b) => b.change - a.change);
      break;
    // ... additional sorting options
  }

  // Apply favorites priority
  const favoriteItems = filtered.filter(crypto => favorites.has(crypto.symbol));
  const nonFavoriteItems = filtered.filter(crypto => !favorites.has(crypto.symbol));
  
  return [...favoriteItems, ...nonFavoriteItems].slice(0, displayCount);
};
```

### Chart Data Generation

#### SVG Path Generation
```typescript
const generatePath = (data: number[]) => {
  const width = 140;
  const height = 35;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');
};
```

## ⚡ Performance Optimizations

### React Optimizations

#### 1. Memoization Strategy
```typescript
// Expensive filtering computation
const filteredCryptoData = useMemo(() => {
  return getFilteredAndSortedData();
}, [searchQuery, tickerSearch, currentFilter, sortOption, favorites, showOnlyFavorites, displayCount]);
```

#### 2. Event Handler Optimization
```typescript
// Prevent unnecessary re-renders
const handleCardClick = useCallback((e: React.MouseEvent) => {
  if ((e.target as HTMLElement).closest('button')) {
    return;
  }
  setShowDetailModal(true);
}, []);
```

#### 3. Conditional Rendering
```typescript
// Prevent hydration mismatches
if (!isThemeLoaded) {
  return null;
}

// Lazy load modals
{showAIModal && (
  <AIStrategyModal
    isOpen={showAIModal}
    onClose={() => setShowAIModal(false)}
    symbol={symbol}
    isDark={isDark}
  />
)}
```

### CSS Performance

#### 1. Hardware Acceleration
```css
.transition-all {
  transform: translateZ(0); /* Force hardware acceleration */
}

.hover\:scale-\[1\.02\]:hover {
  transform: scale(1.02) translateZ(0);
}
```

#### 2. Efficient Animations
```css
@keyframes neon-pulse {
  from {
    box-shadow: 0 0 13px rgba(16, 185, 129, 0.26);
  }
  to {
    box-shadow: 0 0 15.6px rgba(16, 185, 129, 0.39);
  }
}
```

## 📁 Code Organization

### File Structure Principles

#### 1. Feature-Based Organization
```
components/
├── ui/                    # Reusable UI primitives
├── modals/               # Modal components
│   ├── AIStrategyModal.tsx
│   └── CryptoDetailModal.tsx
├── panels/               # Panel components
│   ├── ControlsPanel.tsx
│   └── PumpDumpTracker.tsx
└── crypto/               # Crypto-specific components
    ├── CryptoCard.tsx
    └── CryptoListItem.tsx
```

#### 2. Separation of Concerns
```typescript
// Pure presentation component
export function CryptoCard({ symbol, name, price, ... }) {
  // No business logic, only UI rendering
}

// Container component with logic
export function CryptoDisplay() {
  const filteredData = useFilteredCryptos();
  const { favorites, toggleFavorite } = useFavorites();
  
  return (
    <div>
      {filteredData.map(crypto => (
        <CryptoCard key={crypto.symbol} {...crypto} />
      ))}
    </div>
  );
}
```

### TypeScript Integration

#### 1. Interface Definitions
```typescript
interface CryptoCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  signal: 'PUMP' | 'DUMP' | 'NEUTRAL';
  chartData: number[];
  isDark: boolean;
}
```

#### 2. Type Guards
```typescript
const isPumpSignal = (signal: string): signal is 'PUMP' => {
  return signal === 'PUMP';
};
```

## 🛠 Development Guidelines

### Component Development

#### 1. Component Structure
```typescript
'use client'; // For client-side components

import { useState, useEffect } from 'react';
import { Icon } from 'lucide-react';

interface ComponentProps {
  // Props interface
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // State declarations
  const [state, setState] = useState(initialValue);
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };
  
  // Render helpers
  const renderHelper = () => {
    // Helper rendering logic
  };
  
  // Main render
  return (
    <div className="component-styles">
      {/* Component JSX */}
    </div>
  );
}
```

#### 2. Styling Conventions
```typescript
// Dynamic class generation
const getClasses = () => {
  return `base-classes ${
    condition 
      ? 'conditional-classes' 
      : 'alternative-classes'
  }`;
};

// Consistent spacing and sizing
<div className="p-4 rounded-xl transition-all duration-300">
```

#### 3. Event Handling
```typescript
// Prevent event bubbling
const handleButtonClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  // Button logic
};

// Type-safe event handlers
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

### State Management Best Practices

#### 1. State Colocation
```typescript
// Keep state close to where it's used
function Modal() {
  const [isOpen, setIsOpen] = useState(false); // Local to modal
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && <ModalContent onClose={() => setIsOpen(false)} />}
    </div>
  );
}
```

#### 2. State Lifting
```typescript
// Lift state when shared between components
function Parent() {
  const [sharedState, setSharedState] = useState(initialValue);
  
  return (
    <div>
      <ChildA state={sharedState} onChange={setSharedState} />
      <ChildB state={sharedState} />
    </div>
  );
}
```

### Testing Considerations

#### 1. Component Testing
```typescript
// Test component behavior, not implementation
test('should toggle favorite when star is clicked', () => {
  render(<CryptoCard {...props} />);
  
  const starButton = screen.getByRole('button', { name: /add to favorites/i });
  fireEvent.click(starButton);
  
  expect(mockToggleFavorite).toHaveBeenCalledWith(props.symbol);
});
```

#### 2. Integration Testing
```typescript
// Test component interactions
test('should filter cryptocurrencies when search is used', () => {
  render(<App />);
  
  const searchInput = screen.getByPlaceholderText(/search crypto/i);
  fireEvent.change(searchInput, { target: { value: 'BTC' } });
  
  expect(screen.getByText('Bitcoin')).toBeInTheDocument();
  expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
});
```

## 🔧 Build and Deployment

### Build Configuration

#### 1. Next.js Build
```bash
# Development
npm run dev

# Production build
npm run build

# Static export (generates /out directory)
npm run build && npm run export
```

#### 2. TypeScript Compilation
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noEmit": true,
    "jsx": "preserve",
    "moduleResolution": "bundler"
  }
}
```

### Deployment Strategies

#### 1. Static Hosting
- **Netlify**: Drag and drop `/out` folder
- **Vercel**: Connect GitHub repository
- **GitHub Pages**: Upload `/out` contents

#### 2. CDN Optimization
- Automatic asset optimization with Next.js
- Image optimization disabled for static export
- CSS and JS minification included

---

This technical documentation provides a comprehensive overview of the CryptoScanner application architecture, implementation details, and development guidelines. It serves as a reference for developers working on the project and ensures consistent code quality and maintainability.