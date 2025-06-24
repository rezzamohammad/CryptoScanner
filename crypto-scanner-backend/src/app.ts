/**
 * Main Express Application
 * CryptoScanner Backend Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { SERVER_CONFIG, CORS_CONFIG } from '@/config/constants.js';
import { apiLimiter, aiLimiter, marketDataLimiter } from '@/middleware/rateLimit.js';
import { authenticateApiKey, optionalAuth } from '@/middleware/auth.js';
import { MarketController } from '@/controllers/marketController.js';
import { AIController } from '@/controllers/aiController.js';
import { binanceService } from '@/services/binanceService.js';
import { wsServer } from '@/services/websocketServer.js';

/**
 * Create Express application
 */
const app = express();

/**
 * Security middleware
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

/**
 * CORS configuration
 */
app.use(cors({
  origin: CORS_CONFIG.ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request logging middleware
 */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

/**
 * Health check endpoint (no auth required)
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        binance: binanceService.getConnectionStatus(),
        websocket: wsServer.getStats().isRunning
      }
    }
  });
});

/**
 * API Routes with rate limiting and authentication
 */

// Market data routes (lenient rate limiting, optional auth)
app.use('/api/market', marketDataLimiter);
app.get('/api/market/health', optionalAuth, MarketController.healthCheck);
app.get('/api/market/tickers', optionalAuth, MarketController.getAllTickers);
app.get('/api/market/ticker/:symbol', optionalAuth, MarketController.getTicker);
app.get('/api/market/stats', optionalAuth, MarketController.getMarketStats);
app.get('/api/market/settings', optionalAuth, MarketController.getSettings);
app.post('/api/market/settings', authenticateApiKey, MarketController.updateSettings);

// AI analysis routes (strict rate limiting, authentication required)
app.use('/api/ai', aiLimiter);
app.get('/api/ai/status', optionalAuth, AIController.getStatus);
app.get('/api/ai/models', optionalAuth, AIController.getModels);
app.post('/api/ai/test', authenticateApiKey, AIController.testService);
app.post('/api/ai/analyze/:symbol', authenticateApiKey, AIController.analyzeSymbol);

/**
 * Global rate limiting for all other routes
 */
app.use('/api', apiLimiter);

/**
 * 404 handler
 */
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
});

/**
 * Global error handler
 */
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(SERVER_CONFIG.NODE_ENV === 'development' && { 
      details: error.message,
      stack: error.stack 
    })
  });
});

/**
 * Start server function
 */
export async function startServer(): Promise<void> {
  try {
    // Start HTTP server
    const httpServer = app.listen(SERVER_CONFIG.PORT, SERVER_CONFIG.HOST, () => {
      console.log(`🚀 CryptoScanner Backend Server started`);
      console.log(`📡 HTTP API: http://${SERVER_CONFIG.HOST}:${SERVER_CONFIG.PORT}`);
      console.log(`🌐 Environment: ${SERVER_CONFIG.NODE_ENV}`);
    });

    // Start WebSocket server on different port
    const wsPort = SERVER_CONFIG.PORT + 1;
    wsServer.start(wsPort);
    console.log(`🔌 WebSocket Server: ws://${SERVER_CONFIG.HOST}:${wsPort}`);

    // Connect to Binance WebSocket
    console.log('🔗 Connecting to Binance WebSocket...');
    binanceService.connect();

    // Setup graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);
      
      // Stop accepting new connections
      httpServer.close(() => {
        console.log('✅ HTTP server closed');
      });

      // Stop WebSocket server
      wsServer.stop();
      console.log('✅ WebSocket server closed');

      // Disconnect from Binance
      binanceService.disconnect();
      console.log('✅ Binance connection closed');

      console.log('👋 Graceful shutdown completed');
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Start server if this file is run directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default app;
