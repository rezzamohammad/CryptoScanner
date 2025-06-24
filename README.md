# CryptoScanner - Real-Time Pump & Dump Detection Dashboard

A sophisticated, production-ready cryptocurrency monitoring dashboard that detects pump and dump signals in real-time with advanced AI-powered analysis and beautiful, responsive design.

## 🚀 Features

### Core Functionality
- **Real-Time Signal Detection**: Advanced algorithms detect PUMP, DUMP, and NEUTRAL signals
- **AI Strategy Reports**: Gemini-powered analysis for pump signals with detailed market insights
- **Multiple Detection Models**: Logarithmic, Exponential, and Parabolic detection algorithms
- **Customizable Sensitivity**: Adjustable price and volume sensitivity controls
- **Event Tracking**: Pin and track important pump/dump events with timestamps

### User Experience
- **Dual View Modes**: Switch between grid cards and compact list views
- **Advanced Filtering**: Sort by volume, price change, signal type, detection time
- **Smart Search**: Search by ticker symbols or cryptocurrency names
- **Favorites System**: Star and organize your favorite cryptocurrencies
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Elegant theme switching with smooth transitions

### Visual Design
- **Neon Glow Effects**: Beautiful neon shadows and glowing elements
- **Interactive Charts**: Mini SVG charts with gradient fills and animations
- **Smooth Animations**: Micro-interactions and hover effects throughout
- **Production-Ready UI**: Apple-level design aesthetics with attention to detail

## 🛠 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom neon effects
- **UI Components**: shadcn/ui + Radix UI primitives
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Build Tool**: Next.js with static export support

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crypto-scanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🏗 Project Structure

```
crypto-scanner/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles with neon effects
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Main dashboard page
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── AIStrategyModal.tsx      # AI analysis modal
│   ├── ControlsPanel.tsx        # Detection settings panel
│   ├── CryptoCard.tsx           # Grid view crypto cards
│   ├── CryptoDetailModal.tsx    # Detailed crypto information
│   ├── CryptoDisplayControls.tsx # Display configuration
│   ├── CryptoListItem.tsx       # List view crypto items
│   ├── FilterDropdown.tsx       # Sorting and filtering
│   ├── PumpDumpTracker.tsx      # Event tracking system
│   ├── SearchBox.tsx            # Search functionality
│   ├── ThemeToggle.tsx          # Dark/light theme switch
│   └── ViewToggle.tsx           # Grid/list view toggle
├── lib/                         # Utility functions
│   └── utils.ts                 # Tailwind class utilities
└── public/                      # Static assets
```

## 🎨 Design System

### Color Palette
- **Primary**: Emerald/Teal gradients for positive signals
- **Secondary**: Red/Pink gradients for negative signals
- **Accent**: Yellow for favorites and pinned items
- **Neutral**: Gray scale for backgrounds and text

### Neon Effects
- Custom CSS classes for glowing shadows
- Animated pulse effects for active elements
- Gradient overlays for enhanced visual appeal
- Responsive glow intensity based on interaction states

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)
- **Hierarchy**: Clear visual hierarchy with consistent spacing

## 🔧 Configuration

### Detection Models
- **Logarithmic**: Highest sensitivity for fast spikes
- **Exponential**: Balanced detection for typical pumps
- **Parabolic**: Lower sensitivity for gradual acceleration

### Sensitivity Controls
- **Price Sensitivity**: 0.1% - 50% threshold adjustment
- **Volume Sensitivity**: 1.5x - 10x volume spike detection

### Display Options
- **Crypto Count**: 1-100 cryptocurrencies displayed
- **Ticker Filtering**: Filter by specific symbols
- **Favorites**: Star system with priority display
- **View Modes**: Grid cards or compact list

## 📊 Data Structure

### Cryptocurrency Object
```typescript
interface CryptoData {
  symbol: string;           // Ticker symbol (e.g., "BTC")
  name: string;            // Full name (e.g., "Bitcoin")
  price: number;           // Current price in USD
  change: number;          // 24h percentage change
  volume: string;          // 24h volume (formatted)
  signal: 'PUMP' | 'DUMP' | 'NEUTRAL';
  chartData: number[];     // Price history for mini chart
  detectionTime: Date;     // When signal was detected
}
```

### Event Tracking
```typescript
interface PumpDumpEvent {
  id: string;              // Unique identifier
  symbol: string;          // Crypto symbol
  name: string;            // Crypto name
  type: 'PUMP' | 'DUMP';   // Event type
  price: number;           // Price at detection
  change: number;          // Percentage change
  volume: string;          // Trading volume
  timestamp: Date;         // Event timestamp
  detectionTime: string;   // Formatted time
  isPinned?: boolean;      // User pinned status
}
```

## 🎯 Key Components

### AIStrategyModal
- Simulates AI analysis with loading states
- Displays technical indicators and strategy recommendations
- Risk warnings and probability assessments
- Responsive modal with backdrop blur

### PumpDumpTracker
- Real-time event tracking with timestamps
- Pin/unpin functionality for important events
- Configurable event history limit
- Scrollable list with visual indicators

### CryptoDisplayControls
- Dynamic display count with slider and input
- Ticker symbol filtering
- Favorites management
- Settings persistence

### ThemeToggle
- Smooth dark/light mode transitions
- System preference detection
- Animated slider with icons
- Persistent theme storage

## 🚀 Deployment

### Static Export
The project is configured for static export:

```bash
npm run build
```

This generates a static site in the `out/` directory that can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

### Environment Variables
No environment variables required for basic functionality.

## 🔮 Future Enhancements

### Planned Features
- Real-time WebSocket data integration
- Historical price charts with TradingView
- Portfolio tracking and alerts
- Social sentiment analysis
- Mobile app with React Native
- Advanced technical indicators

### API Integration
- Binance WebSocket for real-time data
- CoinGecko API for market data
- Custom backend for signal processing
- User authentication and preferences

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **shadcn/ui** for the excellent component library
- **Tailwind CSS** for the utility-first styling approach
- **Lucide React** for the beautiful icon set
- **Next.js** team for the amazing framework

---

**Built with ❤️ for the crypto community**