/**
 * AI Analysis Controller
 * Handles API endpoints for AI-powered market analysis
 */

import type { Request, Response } from 'express';
import { geminiService } from '@/services/geminiService.js';
import { binanceService } from '@/services/binanceService.js';

/**
 * AI analysis response interface
 */
interface AIAnalysisResponse {
  success: boolean;
  data: {
    symbol: string;
    analysis: any;
    generatedAt: string;
    model: string;
  };
  timestamp: string;
}

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: string;
  timestamp: string;
}

/**
 * AI Controller Class
 */
export class AIController {
  /**
   * Generate AI analysis for a specific cryptocurrency
   * POST /api/ai/analyze/:symbol
   */
  static async analyzeSymbol(req: Request, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;

      if (!symbol) {
        res.status(400).json({
          success: false,
          error: 'Symbol parameter is required',
          timestamp: new Date().toISOString()
        } as ErrorResponse);
        return;
      }

      // Validate symbol format
      const normalizedSymbol = symbol.toUpperCase();
      if (!normalizedSymbol.endsWith('USDT')) {
        res.status(400).json({
          success: false,
          error: 'Symbol must be a USDT trading pair',
          timestamp: new Date().toISOString()
        } as ErrorResponse);
        return;
      }

      // Check if AI service is configured
      if (!geminiService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: 'AI analysis service is not configured',
          timestamp: new Date().toISOString()
        } as ErrorResponse);
        return;
      }

      // Check if market data service is connected
      if (!binanceService.isConnected()) {
        res.status(503).json({
          success: false,
          error: 'Market data service is not connected',
          timestamp: new Date().toISOString()
        } as ErrorResponse);
        return;
      }

      // Get current market data for the symbol
      const coinData = binanceService.getCurrentCoinData(normalizedSymbol);
      if (!coinData || !coinData.ta) {
        res.status(404).json({
          success: false,
          error: `Insufficient data for analysis of ${normalizedSymbol}. Symbol may not be actively traded or data is still being gathered.`,
          timestamp: new Date().toISOString()
        } as ErrorResponse);
        return;
      }

      const settings = binanceService.getDetectionSettings();
      const analysis = await geminiService.getAdvancedAnalysis(coinData, settings);

      const response: AIAnalysisResponse = {
        success: true,
        data: {
          symbol: normalizedSymbol,
          analysis,
          generatedAt: new Date().toISOString(),
          model: settings.model
        },
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      console.error('Error in analyzeSymbol:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during AI analysis',
        timestamp: new Date().toISOString()
      } as ErrorResponse);
    }
  }

  /**
   * Get AI service status and usage statistics
   * GET /api/ai/status
   */
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const isConfigured = geminiService.isConfigured();
      const usageStats = geminiService.getUsageStats();

      res.json({
        success: true,
        data: {
          configured: isConfigured,
          status: isConfigured ? 'available' : 'not_configured',
          usage: {
            totalRequests: usageStats.requestCount,
            lastRequestTime: usageStats.lastRequestTime ? new Date(usageStats.lastRequestTime).toISOString() : null
          },
          capabilities: {
            technicalAnalysis: true,
            strategyRecommendations: true,
            riskAssessment: true,
            marketSentiment: false // Not implemented yet
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getStatus:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      } as ErrorResponse);
    }
  }

  /**
   * Test AI service connectivity
   * POST /api/ai/test
   */
  static async testService(req: Request, res: Response): Promise<void> {
    try {
      if (!geminiService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: 'AI service is not configured',
          timestamp: new Date().toISOString()
        } as ErrorResponse);
        return;
      }

      // Create a simple test request
      const testCoin = {
        symbol: 'BTCUSDT',
        price: 50000,
        priceChangePercent: 2.5,
        volume: 1000000,
        signal: 'PUMP',
        priceHistory: [49000, 49500, 50000],
        ta: {
          sma: 49500,
          rsi: 65,
          high: 50500,
          low: 48500,
          priceVsSma: 'Above' as const,
          bollingerBands: {
            upper: '51000.0000',
            middle: '49500.0000',
            lower: '48000.0000'
          }
        },
        lastUpdated: new Date()
      };

      const testSettings = {
        eps_price: 1.02,
        eps_volume: 2.0,
        model: 'Exponential' as const
      };

      const startTime = Date.now();
      const analysis = await geminiService.getAdvancedAnalysis(testCoin, testSettings);
      const responseTime = Date.now() - startTime;

      res.json({
        success: true,
        data: {
          status: 'test_successful',
          responseTime: `${responseTime}ms`,
          testAnalysis: {
            reason: analysis.Reason,
            hasValidResponse: !!analysis.SuggestedStrategy
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in testService:', error);
      res.status(500).json({
        success: false,
        error: `AI service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      } as ErrorResponse);
    }
  }

  /**
   * Get available AI models and capabilities
   * GET /api/ai/models
   */
  static async getModels(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          currentModel: 'gemini-2.0-flash',
          capabilities: {
            structuredOutput: true,
            technicalAnalysis: true,
            riskAssessment: true,
            strategyGeneration: true,
            multiLanguage: false
          },
          detectionModels: [
            {
              name: 'Logarithmic',
              description: 'Highest sensitivity. Best for catching fast, sharp initial spikes.',
              sensitivity: 'High'
            },
            {
              name: 'Exponential',
              description: 'Balanced (Default). Best for typical, steady-growth pumps.',
              sensitivity: 'Medium'
            },
            {
              name: 'Parabolic',
              description: 'Lowest sensitivity. Tuned for pumps that start slow and accelerate late.',
              sensitivity: 'Low'
            }
          ]
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getModels:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      } as ErrorResponse);
    }
  }
}
