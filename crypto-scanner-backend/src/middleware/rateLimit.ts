/**
 * Rate Limiting Middleware
 * Prevents API abuse and ensures service stability
 */

import rateLimit from 'express-rate-limit';
import { SECURITY_CONFIG } from '@/config/constants.js';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS,
  max: SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for AI analysis endpoints
 */
export const aiLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    error: 'Too many AI analysis requests, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Lenient rate limiter for market data endpoints
 */
export const marketDataLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: 'Too many market data requests, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});
