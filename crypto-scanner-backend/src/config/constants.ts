/**
 * Configuration constants extracted from legacy crypto_scanner.js
 * These values control the behavior of technical analysis and detection algorithms
 */

import dotenv from 'dotenv';

dotenv.config();

// Server Configuration
export const SERVER_CONFIG = {
  NODE_ENV: process.env['NODE_ENV'] || 'development',
  PORT: parseInt(process.env['PORT'] || '3001', 10),
  HOST: process.env['HOST'] || 'localhost',
} as const;

// Binance WebSocket Configuration
export const BINANCE_CONFIG = {
  WS_URL: process.env['BINANCE_WS_URL'] || 'wss://stream.binance.com:9443/ws/!ticker@arr',
  RECONNECT_DELAY: 5000, // 5 seconds
  MAX_RECONNECT_ATTEMPTS: 10,
} as const;

// Technical Analysis Configuration (from legacy lines 102-106)
export const TA_CONFIG = {
  DATA_HISTORY_LENGTH: parseInt(process.env['DATA_HISTORY_LENGTH'] || '200', 10),
  SPARKLINE_DATA_LENGTH: parseInt(process.env['SPARKLINE_DATA_LENGTH'] || '30', 10),
  MA_PERIOD: parseInt(process.env['MA_PERIOD'] || '60', 10),
  RSI_PERIOD: parseInt(process.env['RSI_PERIOD'] || '14', 10),
  BBANDS_PERIOD: parseInt(process.env['BBANDS_PERIOD'] || '20', 10),
  BBANDS_STD_DEV: 2, // Standard deviation multiplier for Bollinger Bands
} as const;

// Detection Engine Configuration (from legacy lines 288, 148-150)
export const DETECTION_CONFIG = {
  DEFAULT_PRICE_SENSITIVITY: parseFloat(process.env['DEFAULT_PRICE_SENSITIVITY'] || '1.001'),
  DEFAULT_VOLUME_SENSITIVITY: parseFloat(process.env['DEFAULT_VOLUME_SENSITIVITY'] || '2.0'),
  DEFAULT_MODEL: process.env['DEFAULT_DETECTION_MODEL'] || 'Exponential',
  
  // Model sensitivity multipliers (from legacy lines 149-150)
  MODEL_MULTIPLIERS: {
    Parabolic: 0.8,    // Lower sensitivity
    Exponential: 1.0,  // Balanced (default)
    Logarithmic: 1.2,  // Higher sensitivity
  },
  
  // Signal thresholds
  STRONG_PUMP_THRESHOLD: 0.005, // Additional threshold for STRONG_PUMP (from legacy line 156)
  DUMP_THRESHOLD: -2.0,         // Percentage change threshold for DUMP (from legacy line 162)
} as const;

// Signal Types (from legacy detection engine)
export const SIGNAL_TYPES = {
  GATHERING_DATA: 'GATHERING_DATA',
  NEUTRAL: 'NEUTRAL',
  PUMP: 'PUMP',
  STRONG_PUMP: 'STRONG_PUMP',
  DUMP: 'DUMP',
} as const;

// Signal Priority Order (from legacy lines 368)
export const SIGNAL_PRIORITY = {
  [SIGNAL_TYPES.STRONG_PUMP]: 5,
  [SIGNAL_TYPES.PUMP]: 4,
  [SIGNAL_TYPES.DUMP]: 3,
  [SIGNAL_TYPES.NEUTRAL]: 2,
  [SIGNAL_TYPES.GATHERING_DATA]: 1,
} as const;

// Gemini AI Configuration
export const GEMINI_CONFIG = {
  API_KEY: process.env['GEMINI_API_KEY'] || '',
  API_URL: process.env['GEMINI_API_URL'] || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  JWT_SECRET: process.env['JWT_SECRET'] || 'fallback-secret-change-in-production',
  API_KEY: process.env['API_KEY'] || '',
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
    MAX_REQUESTS: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  },
} as const;

// WebSocket Configuration
export const WS_CONFIG = {
  HEARTBEAT_INTERVAL: parseInt(process.env['WS_HEARTBEAT_INTERVAL'] || '30000', 10),
  MAX_CONNECTIONS: parseInt(process.env['WS_MAX_CONNECTIONS'] || '1000', 10),
} as const;

// CORS Configuration
export const CORS_CONFIG = {
  ALLOWED_ORIGINS: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3000'],
} as const;

// Logging Configuration
export const LOG_CONFIG = {
  LEVEL: process.env['LOG_LEVEL'] || 'info',
  FILE: process.env['LOG_FILE'] || 'logs/app.log',
} as const;

// Data Types
export type DetectionModel = keyof typeof DETECTION_CONFIG.MODEL_MULTIPLIERS;
export type SignalType = keyof typeof SIGNAL_TYPES;

// Detection Settings Interface (from legacy lines 288)
export interface DetectionSettings {
  eps_price: number;
  eps_volume: number;
  model: DetectionModel;
}

// Default Detection Settings
export const DEFAULT_DETECTION_SETTINGS: DetectionSettings = {
  eps_price: DETECTION_CONFIG.DEFAULT_PRICE_SENSITIVITY,
  eps_volume: DETECTION_CONFIG.DEFAULT_VOLUME_SENSITIVITY,
  model: DETECTION_CONFIG.DEFAULT_MODEL as DetectionModel,
};

// Validation
if (!GEMINI_CONFIG.API_KEY && SERVER_CONFIG.NODE_ENV === 'production') {
  console.warn('⚠️  GEMINI_API_KEY is not set. AI analysis will not work.');
}

if (!SECURITY_CONFIG.API_KEY && SERVER_CONFIG.NODE_ENV === 'production') {
  console.warn('⚠️  API_KEY is not set. API authentication will not work.');
}
