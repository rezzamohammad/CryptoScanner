import dotenv from 'dotenv';
dotenv.config();
export const SERVER_CONFIG = {
    NODE_ENV: process.env['NODE_ENV'] || 'development',
    PORT: parseInt(process.env['PORT'] || '3001', 10),
    HOST: process.env['HOST'] || 'localhost',
};
export const BINANCE_CONFIG = {
    WS_URL: process.env['BINANCE_WS_URL'] || 'wss://stream.binance.com:9443/ws/!ticker@arr',
    RECONNECT_DELAY: 5000,
    MAX_RECONNECT_ATTEMPTS: 10,
};
export const TA_CONFIG = {
    DATA_HISTORY_LENGTH: parseInt(process.env['DATA_HISTORY_LENGTH'] || '200', 10),
    SPARKLINE_DATA_LENGTH: parseInt(process.env['SPARKLINE_DATA_LENGTH'] || '30', 10),
    MA_PERIOD: parseInt(process.env['MA_PERIOD'] || '60', 10),
    RSI_PERIOD: parseInt(process.env['RSI_PERIOD'] || '14', 10),
    BBANDS_PERIOD: parseInt(process.env['BBANDS_PERIOD'] || '20', 10),
    BBANDS_STD_DEV: 2,
};
export const DETECTION_CONFIG = {
    DEFAULT_PRICE_SENSITIVITY: parseFloat(process.env['DEFAULT_PRICE_SENSITIVITY'] || '1.001'),
    DEFAULT_VOLUME_SENSITIVITY: parseFloat(process.env['DEFAULT_VOLUME_SENSITIVITY'] || '2.0'),
    DEFAULT_MODEL: process.env['DEFAULT_DETECTION_MODEL'] || 'Exponential',
    MODEL_MULTIPLIERS: {
        Parabolic: 0.8,
        Exponential: 1.0,
        Logarithmic: 1.2,
    },
    STRONG_PUMP_THRESHOLD: 0.005,
    DUMP_THRESHOLD: -2.0,
};
export const SIGNAL_TYPES = {
    GATHERING_DATA: 'GATHERING_DATA',
    NEUTRAL: 'NEUTRAL',
    PUMP: 'PUMP',
    STRONG_PUMP: 'STRONG_PUMP',
    DUMP: 'DUMP',
};
export const SIGNAL_PRIORITY = {
    [SIGNAL_TYPES.STRONG_PUMP]: 5,
    [SIGNAL_TYPES.PUMP]: 4,
    [SIGNAL_TYPES.DUMP]: 3,
    [SIGNAL_TYPES.NEUTRAL]: 2,
    [SIGNAL_TYPES.GATHERING_DATA]: 1,
};
export const GEMINI_CONFIG = {
    API_KEY: process.env['GEMINI_API_KEY'] || '',
    API_URL: process.env['GEMINI_API_URL'] || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    TIMEOUT: 30000,
    MAX_RETRIES: 3,
};
export const SECURITY_CONFIG = {
    JWT_SECRET: process.env['JWT_SECRET'] || 'fallback-secret-change-in-production',
    API_KEY: process.env['API_KEY'] || '',
    RATE_LIMIT: {
        WINDOW_MS: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10),
        MAX_REQUESTS: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
    },
};
export const WS_CONFIG = {
    HEARTBEAT_INTERVAL: parseInt(process.env['WS_HEARTBEAT_INTERVAL'] || '30000', 10),
    MAX_CONNECTIONS: parseInt(process.env['WS_MAX_CONNECTIONS'] || '1000', 10),
};
export const CORS_CONFIG = {
    ALLOWED_ORIGINS: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3000'],
};
export const LOG_CONFIG = {
    LEVEL: process.env['LOG_LEVEL'] || 'info',
    FILE: process.env['LOG_FILE'] || 'logs/app.log',
};
export const DEFAULT_DETECTION_SETTINGS = {
    eps_price: DETECTION_CONFIG.DEFAULT_PRICE_SENSITIVITY,
    eps_volume: DETECTION_CONFIG.DEFAULT_VOLUME_SENSITIVITY,
    model: DETECTION_CONFIG.DEFAULT_MODEL,
};
if (!GEMINI_CONFIG.API_KEY && SERVER_CONFIG.NODE_ENV === 'production') {
    console.warn('⚠️  GEMINI_API_KEY is not set. AI analysis will not work.');
}
if (!SECURITY_CONFIG.API_KEY && SERVER_CONFIG.NODE_ENV === 'production') {
    console.warn('⚠️  API_KEY is not set. API authentication will not work.');
}
//# sourceMappingURL=constants.js.map