import rateLimit from 'express-rate-limit';
import { SECURITY_CONFIG } from '@/config/constants.js';
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
export const aiLimiter = rateLimit({
    windowMs: 60000,
    max: 10,
    message: {
        success: false,
        error: 'Too many AI analysis requests, please try again later',
        timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
});
export const marketDataLimiter = rateLimit({
    windowMs: 60000,
    max: 100,
    message: {
        success: false,
        error: 'Too many market data requests, please try again later',
        timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimit.js.map