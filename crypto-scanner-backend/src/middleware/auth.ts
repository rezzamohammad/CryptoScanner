/**
 * Authentication Middleware
 * Provides API key authentication for backend endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { SECURITY_CONFIG } from '@/config/constants.js';

/**
 * Extended Request interface with user info
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    apiKey: string;
    authenticated: boolean;
  };
}

/**
 * API Key Authentication Middleware
 */
export function authenticateApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Skip authentication in development if no API key is set
  if (SECURITY_CONFIG.API_KEY === '' && process.env['NODE_ENV'] === 'development') {
    req.user = { apiKey: 'dev-mode', authenticated: true };
    next();
    return;
  }

  const apiKey = req.headers['x-api-key'] as string;

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

/**
 * Optional Authentication Middleware
 * Allows requests without API key but marks them as unauthenticated
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string;

  if (apiKey && apiKey === SECURITY_CONFIG.API_KEY) {
    req.user = { apiKey, authenticated: true };
  } else {
    req.user = { apiKey: '', authenticated: false };
  }

  next();
}
