# CryptoScanner Refactor & Separation Plan

## 📋 Executive Summary

This document outlines the comprehensive plan to refactor the monolithic `crypto_scanner.js` file into a secure, scalable architecture with separated backend and frontend concerns.

**Current State**: Single-file React application (431 lines) containing both UI and backend logic
**Target State**: Secure Node.js/Express backend + Clean Next.js frontend communicating via APIs

## 🎯 Objectives

1. **Security**: Move sensitive detection algorithms and AI logic to backend
2. **Scalability**: Enable independent deployment and scaling of backend/frontend
3. **Maintainability**: Clean separation of concerns with modular architecture
4. **Performance**: Optimize data flow and reduce client-side processing
5. **Future-Ready**: Prepare for real-time features and multi-client support

## 🔍 Analysis of Legacy Code

### Backend Logic to Extract (Lines 100-202, 310-365)

#### 1. **WebSocket Connection Management** (Lines 310-365)
- Binance WebSocket connection (`BINANCE_WS_URL`)
- Real-time ticker data processing
- Data history management (`dataHistory.current`)
- Connection status handling

#### 2. **Technical Analysis Service** (Lines 108-136)
- Simple Moving Average (SMA) calculation
- Relative Strength Index (RSI) calculation  
- Bollinger Bands calculation
- High/Low detection algorithms

#### 3. **Pump & Dump Detection Engine** (Lines 138-165)
- Core detection algorithm with multiple models:
  - Logarithmic (highest sensitivity)
  - Exponential (balanced)
  - Parabolic (lowest sensitivity)
- Price anomaly detection
- Volume spike analysis
- Signal classification (PUMP, DUMP, STRONG_PUMP, NEUTRAL)

#### 4. **AI Analysis Integration** (Lines 167-202)
- Gemini API integration
- Advanced market analysis generation
- Technical indicator interpretation
- Strategy recommendations and risk warnings

#### 5. **Data Processing Pipeline** (Lines 315-359)
- Real-time price/volume data transformation
- Historical data management (200 data points)
- Volume-per-second calculations
- Signal detection orchestration

### Frontend Components to Keep (Lines 1-99, 203-430)

#### 1. **UI Components** (Lines 206-281)
- Header with theme toggle
- CryptoCard display component
- Sparkline chart visualization
- GeminiAnalysisModal for AI reports

#### 2. **State Management** (Lines 285-308)
- Theme context and provider
- Settings state (detection model, sensitivity)
- UI state (modals, connection status)

#### 3. **Styling System** (Lines 4-71)
- CSS-in-JS styles
- Theme variables (light/dark)
- Responsive design classes
- Animation definitions

## 🏗️ New Architecture Design

### Backend Service (Node.js/Express)

```
crypto-scanner-backend/
├── src/
│   ├── controllers/
│   │   ├── marketController.js      # Market data endpoints
│   │   ├── signalsController.js     # Detection results
│   │   └── aiController.js          # AI analysis endpoints
│   ├── services/
│   │   ├── binanceService.js        # WebSocket connection
│   │   ├── technicalAnalysis.js     # TA calculations
│   │   ├── detectionEngine.js       # Pump/dump detection
│   │   └── geminiService.js         # AI integration
│   ├── middleware/
│   │   ├── auth.js                  # API authentication
│   │   ├── rateLimit.js             # Rate limiting
│   │   └── cors.js                  # CORS configuration
│   ├── models/
│   │   ├── CryptoData.js            # Data structures
│   │   └── DetectionSettings.js     # Settings schema
│   ├── utils/
│   │   ├── dataProcessor.js         # Data transformation
│   │   └── validators.js            # Input validation
│   └── app.js                       # Express app setup
├── config/
│   ├── database.js                  # Database config
│   └── environment.js               # Environment variables
└── package.json
```

### API Endpoints Design

#### 1. **Market Data Endpoints**
- `GET /api/market/tickers` - Get all cryptocurrency tickers
- `GET /api/market/ticker/:symbol` - Get specific ticker data
- `WebSocket /ws/market` - Real-time market data stream

#### 2. **Signal Detection Endpoints**
- `GET /api/signals/current` - Current detection results
- `GET /api/signals/history` - Historical signals
- `POST /api/signals/settings` - Update detection settings
- `WebSocket /ws/signals` - Real-time signal updates

#### 3. **AI Analysis Endpoints**
- `POST /api/ai/analyze/:symbol` - Generate AI strategy report
- `GET /api/ai/reports/:id` - Retrieve analysis report
- `GET /api/ai/reports/history` - Analysis history

#### 4. **System Endpoints**
- `GET /api/health` - Health check
- `GET /api/status` - System status and metrics

## 📋 Implementation Tasks

### Phase 1: Backend Foundation (Week 1)
- [ ] **Task 1.1**: Set up Node.js/Express project structure
- [ ] **Task 1.2**: Extract and refactor Technical Analysis Service
- [ ] **Task 1.3**: Extract and secure Pump/Dump Detection Engine
- [ ] **Task 1.4**: Implement basic REST API endpoints
- [ ] **Task 1.5**: Add input validation and error handling

### Phase 2: Real-time Data Integration (Week 1-2)
- [ ] **Task 2.1**: Extract and refactor Binance WebSocket service
- [ ] **Task 2.2**: Implement WebSocket server for client connections
- [ ] **Task 2.3**: Create data processing pipeline
- [ ] **Task 2.4**: Add connection management and reconnection logic
- [ ] **Task 2.5**: Implement data persistence layer

### Phase 3: AI Integration & Security (Week 2)
- [ ] **Task 3.1**: Extract and secure Gemini API integration
- [ ] **Task 3.2**: Implement API key management
- [ ] **Task 3.3**: Add rate limiting and authentication
- [ ] **Task 3.4**: Create AI analysis queue system
- [ ] **Task 3.5**: Add comprehensive logging and monitoring

### Phase 4: Frontend API Integration (Week 2-3)
- [ ] **Task 4.1**: Create API client service for frontend
- [ ] **Task 4.2**: Replace mock data with API calls
- [ ] **Task 4.3**: Implement WebSocket client for real-time updates
- [ ] **Task 4.4**: Add error handling and loading states
- [ ] **Task 4.5**: Update state management for API integration

### Phase 5: Testing & Deployment (Week 3)
- [ ] **Task 5.1**: Write comprehensive backend tests
- [ ] **Task 5.2**: Add frontend integration tests
- [ ] **Task 5.3**: Set up CI/CD pipeline
- [ ] **Task 5.4**: Create deployment configurations
- [ ] **Task 5.5**: Performance testing and optimization

## 🔒 Security Considerations

### Backend Security
1. **API Authentication**: JWT tokens or API keys
2. **Rate Limiting**: Prevent API abuse
3. **Input Validation**: Sanitize all inputs
4. **Environment Variables**: Secure configuration management
5. **CORS Configuration**: Restrict frontend origins
6. **Logging**: Comprehensive audit trails

### Sensitive Data Protection
1. **Gemini API Key**: Server-side only, environment variable
2. **Detection Algorithms**: Server-side business logic
3. **Technical Analysis**: Proprietary calculations protected
4. **WebSocket Connections**: Authenticated and rate-limited

## 📊 Data Flow Architecture

### Current (Monolithic)
```
Browser → Single React App → Binance WebSocket
                ↓
        All Processing in Client
                ↓
        UI Updates + AI Calls
```

### Target (Separated)
```
Frontend (Next.js) ←→ Backend API (Express) ←→ Binance WebSocket
        ↓                      ↓                      ↓
   UI Only              Business Logic         External APIs
                              ↓
                        Database/Cache
                              ↓
                         AI Services
```

## 🚀 Deployment Strategy

### Backend Deployment Options
1. **Docker Container**: Containerized deployment
2. **Cloud Services**: AWS/GCP/Azure app services
3. **VPS**: Traditional server deployment
4. **Serverless**: AWS Lambda for specific functions

### Frontend Deployment
1. **Static Hosting**: Vercel/Netlify (current setup)
2. **CDN**: Global content delivery
3. **Environment Configuration**: API endpoint management

## 📈 Success Metrics

### Technical Metrics
- [ ] Backend response time < 100ms for API calls
- [ ] WebSocket connection stability > 99.9%
- [ ] Frontend bundle size reduction > 30%
- [ ] API error rate < 0.1%

## 🔄 Frontend Refactoring Phases

### Phase 1: Foundation (Week 1)
**Priority**: Critical
**Risk**: Low

#### Tasks:
1. **Extract Utility Functions**
   - Create `utils/formatters.ts` for price/volume formatting
   - Create `utils/calculations.ts` for technical analysis
   - Create `utils/validators.ts` for data validation

2. **Create Type Definitions**
   - Extract interfaces to `types/` directory
   - Eliminate `any` types
   - Add proper generic constraints

3. **Extract Custom Hooks**
   - `useLocalStorage` - Centralized localStorage management
   - `useTheme` - Theme management logic
   - `useDebounce` - Debouncing utility

#### Deliverables:
- [ ] `utils/` directory with 3 utility files
- [ ] `types/` directory with comprehensive type definitions
- [ ] `hooks/` directory with 3 custom hooks
- [ ] Updated imports across all components

### Phase 2: Service Layer (Week 2)
**Priority**: High
**Risk**: Medium

#### Tasks:
1. **API Service Refactoring**
   - Split `lib/apiClient.ts` into separate services
   - Implement proper error handling
   - Add request/response interceptors

2. **WebSocket Service**
   - Extract WebSocket logic from components
   - Implement connection pooling
   - Add automatic reconnection

3. **AI Analysis Service**
   - Extract AI logic from `AIStrategyModal`
   - Create validation service
   - Implement caching layer

#### Deliverables:
- [ ] `services/apiService.ts` - REST API client
- [ ] `services/websocketService.ts` - WebSocket management
- [ ] `services/aiAnalysisService.ts` - AI analysis logic
- [ ] `services/eventTrackingService.ts` - Event management
- [ ] Updated components to use services

### Phase 3: Component Decomposition (Week 3)
**Priority**: Critical
**Risk**: High

#### Tasks:
1. **Main Page Refactoring**
   - Split `app/page.tsx` into focused components
   - Create layout components
   - Implement proper error boundaries

2. **Modal Refactoring**
   - Break down `AIStrategyModal` into smaller components
   - Create reusable modal framework
   - Implement proper loading states

3. **Tracker Refactoring**
   - Extract event management from `PumpDumpTracker`
   - Create event processing service
   - Implement proper state management

#### Deliverables:
- [ ] 8 new components from `app/page.tsx` breakdown
- [ ] 12 new components from `AIStrategyModal.tsx` breakdown
- [ ] 6 new components from `PumpDumpTracker.tsx` breakdown
- [ ] Updated routing and component composition

### Security Metrics
- [ ] No sensitive data exposed to client
- [ ] All API endpoints authenticated
- [ ] Rate limiting implemented
- [ ] Comprehensive logging in place

### Maintainability Metrics
- [ ] Code coverage > 80%
- [ ] Clear separation of concerns
- [ ] Modular, testable components
- [ ] Comprehensive documentation

## 🔄 Migration Strategy

### Parallel Development
1. Build backend while keeping legacy frontend functional
2. Gradually replace frontend components with API-integrated versions
3. A/B test new architecture before full migration
4. Maintain backward compatibility during transition

### Rollback Plan
1. Keep legacy monolithic version as backup
2. Feature flags for gradual rollout
3. Database migration scripts with rollback capability
4. Monitoring and alerting for quick issue detection

## 🛠️ Technical Implementation Details

### Backend Technology Stack
- **Runtime**: Node.js 18+ with ES6 modules
- **Framework**: Express.js with TypeScript
- **WebSocket**: ws library for real-time connections
- **Database**: Redis for caching, PostgreSQL for persistence
- **Authentication**: JWT tokens with refresh mechanism
- **Monitoring**: Winston logging + Prometheus metrics
- **Testing**: Jest + Supertest for API testing

### Frontend Integration Points
- **API Client**: Axios with interceptors for auth/error handling
- **WebSocket Client**: Native WebSocket with reconnection logic
- **State Management**: React Query for server state caching
- **Error Boundaries**: Comprehensive error handling
- **Loading States**: Skeleton components during API calls

### Environment Configuration
```bash
# Backend (.env)
NODE_ENV=production
PORT=3001
BINANCE_WS_URL=wss://stream.binance.com:9443/ws/!ticker@arr
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost:5432/cryptoscanner

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
```

### API Response Formats
```typescript
// Market Data Response
interface MarketDataResponse {
  success: boolean;
  data: {
    symbol: string;
    price: number;
    change: number;
    volume: string;
    signal: 'PUMP' | 'DUMP' | 'STRONG_PUMP' | 'NEUTRAL';
    chartData: number[];
    detectionTime: string;
    technicalAnalysis?: {
      sma: number;
      rsi: number;
      bollingerBands: {
        upper: number;
        middle: number;
        lower: number;
      };
    };
  }[];
  timestamp: string;
}

// AI Analysis Response
interface AIAnalysisResponse {
  success: boolean;
  data: {
    symbol: string;
    analysis: {
      reason: string;
      priceAction: object;
      volumeAnalysis: object;
      technicalIndicators: object;
      suggestedStrategy: string;
      riskWarning: string;
    };
    generatedAt: string;
  };
}
```

### WebSocket Message Formats
```typescript
// Client → Server
interface ClientMessage {
  type: 'subscribe' | 'unsubscribe' | 'settings_update';
  payload: {
    symbols?: string[];
    settings?: DetectionSettings;
  };
}

// Server → Client
interface ServerMessage {
  type: 'market_update' | 'signal_detected' | 'connection_status';
  payload: {
    data: MarketData | SignalData | ConnectionStatus;
    timestamp: string;
  };
}
```

### Database Schema Design
```sql
-- Cryptocurrency market data
CREATE TABLE market_data (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  price DECIMAL(20,8) NOT NULL,
  volume DECIMAL(20,2) NOT NULL,
  change_percent DECIMAL(10,4) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_symbol_timestamp (symbol, timestamp)
);

-- Detection signals
CREATE TABLE detection_signals (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  signal_type VARCHAR(20) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL,
  price_at_detection DECIMAL(20,8) NOT NULL,
  volume_spike_ratio DECIMAL(10,4) NOT NULL,
  detection_model VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_symbol_created (symbol, created_at)
);

-- AI analysis reports
CREATE TABLE ai_reports (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  signal_id INTEGER REFERENCES detection_signals(id),
  analysis_data JSONB NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_symbol_generated (symbol, generated_at)
);
```

### Performance Optimizations
1. **Backend Caching**: Redis for frequently accessed data
2. **Database Indexing**: Optimized queries for time-series data
3. **Connection Pooling**: Efficient database connections
4. **Rate Limiting**: Prevent API abuse and ensure stability
5. **Data Compression**: Gzip compression for API responses
6. **WebSocket Optimization**: Message batching and throttling

### Monitoring & Observability
```javascript
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: {
      binance: binanceService.isConnected(),
      database: databaseService.isHealthy(),
      redis: redisService.isConnected()
    }
  });
});
```

### Error Handling Strategy
```typescript
// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('API Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    requestId: req.id
  });
});
```

### Testing Strategy
```javascript
// Backend API tests
describe('Market Data API', () => {
  test('GET /api/market/tickers returns valid data', async () => {
    const response = await request(app)
      .get('/api/market/tickers')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

// Frontend integration tests
describe('Market Data Integration', () => {
  test('displays market data from API', async () => {
    render(<CryptoCard {...mockProps} />);
    await waitFor(() => {
      expect(screen.getByText('BTC')).toBeInTheDocument();
    });
  });
});
```

---

**Next Steps**: Review this comprehensive plan and approve before beginning implementation. Each phase will have detailed technical specifications and acceptance criteria.

**Estimated Timeline**: 3 weeks for complete implementation
**Team Requirements**: 1-2 full-stack developers
**Infrastructure**: Backend server, Redis cache, PostgreSQL database
