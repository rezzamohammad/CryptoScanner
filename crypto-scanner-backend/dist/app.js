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
const app = express();
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
app.use(cors({
    origin: CORS_CONFIG.ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
    next();
});
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
app.use('/api/market', marketDataLimiter);
app.get('/api/market/health', optionalAuth, MarketController.healthCheck);
app.get('/api/market/tickers', optionalAuth, MarketController.getAllTickers);
app.get('/api/market/ticker/:symbol', optionalAuth, MarketController.getTicker);
app.get('/api/market/stats', optionalAuth, MarketController.getMarketStats);
app.get('/api/market/settings', optionalAuth, MarketController.getSettings);
app.post('/api/market/settings', authenticateApiKey, MarketController.updateSettings);
app.use('/api/ai', aiLimiter);
app.get('/api/ai/status', optionalAuth, AIController.getStatus);
app.get('/api/ai/models', optionalAuth, AIController.getModels);
app.post('/api/ai/test', authenticateApiKey, AIController.testService);
app.post('/api/ai/analyze/:symbol', authenticateApiKey, AIController.analyzeSymbol);
app.use('/api', apiLimiter);
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: `API endpoint not found: ${req.method} ${req.path}`,
        timestamp: new Date().toISOString()
    });
});
app.use((error, req, res, next) => {
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
export async function startServer() {
    try {
        const httpServer = app.listen(SERVER_CONFIG.PORT, SERVER_CONFIG.HOST, () => {
            console.log(`🚀 CryptoScanner Backend Server started`);
            console.log(`📡 HTTP API: http://${SERVER_CONFIG.HOST}:${SERVER_CONFIG.PORT}`);
            console.log(`🌐 Environment: ${SERVER_CONFIG.NODE_ENV}`);
        });
        const wsPort = SERVER_CONFIG.PORT + 1;
        wsServer.start(wsPort);
        console.log(`🔌 WebSocket Server: ws://${SERVER_CONFIG.HOST}:${wsPort}`);
        console.log('🔗 Connecting to Binance WebSocket...');
        binanceService.connect();
        const gracefulShutdown = (signal) => {
            console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);
            httpServer.close(() => {
                console.log('✅ HTTP server closed');
            });
            wsServer.stop();
            console.log('✅ WebSocket server closed');
            binanceService.disconnect();
            console.log('✅ Binance connection closed');
            console.log('👋 Graceful shutdown completed');
            process.exit(0);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('uncaughtException', (error) => {
            console.error('💥 Uncaught Exception:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
            gracefulShutdown('UNHANDLED_REJECTION');
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
if (import.meta.url === `file://${process.argv[1]}`) {
    startServer();
}
export default app;
//# sourceMappingURL=app.js.map