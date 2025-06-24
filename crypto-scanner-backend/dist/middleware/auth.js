import { SECURITY_CONFIG } from '@/config/constants.js';
export function authenticateApiKey(req, res, next) {
    if (SECURITY_CONFIG.API_KEY === '' && process.env['NODE_ENV'] === 'development') {
        req.user = { apiKey: 'dev-mode', authenticated: true };
        next();
        return;
    }
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        res.status(401).json({
            success: false,
            error: 'API key is required',
            timestamp: new Date().toISOString()
        });
        return;
    }
    if (apiKey !== SECURITY_CONFIG.API_KEY) {
        res.status(401).json({
            success: false,
            error: 'Invalid API key',
            timestamp: new Date().toISOString()
        });
        return;
    }
    req.user = { apiKey, authenticated: true };
    next();
}
export function optionalAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === SECURITY_CONFIG.API_KEY) {
        req.user = { apiKey, authenticated: true };
    }
    else {
        req.user = { apiKey: '', authenticated: false };
    }
    next();
}
//# sourceMappingURL=auth.js.map