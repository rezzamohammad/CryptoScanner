/**
 * AI Analysis Service
 * Extracted from AIStrategyModal.tsx for better separation of concerns
 *
 * This service handles all AI analysis business logic including:
 * - API communication
 * - Data enhancement
 * - Technical analysis calculations
 * - Error handling and validation
 */

import { AIResponseValidator } from './aiValidationService';
import { handleApiError, logError } from '../lib/errorHandling';
import { ApiClient } from '../lib/apiClient';
import {
  AnalysisData,
  AnalysisDataWithQuality,
  TechnicalAnalysisData,
  SupportResistanceData,
  MarketDataResponse
} from '../types/ai';

/**
 * AI Analysis Service Class
 * Handles all AI analysis operations with proper error handling and data enhancement
 */
export class AIAnalysisService {
  private static readonly API_TIMEOUT = 30000; // 30 seconds
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  /**
   * Fetches AI analysis for a given symbol
   * @param symbol - The cryptocurrency symbol to analyze
   * @returns Promise<AnalysisDataWithQuality | null>
   */
  static async fetchAIAnalysis(symbol: string): Promise<AnalysisDataWithQuality | null> {
    try {
      // Check if backend API is enabled
      const useBackendApi = process.env.NEXT_PUBLIC_ENABLE_BACKEND_API === 'true';

      if (!useBackendApi) {
        throw new Error('AI analysis service is currently unavailable. Please try again later.');
      }

      console.log(`🔍 Fetching AI analysis for ${symbol}...`);

      // Add USDT suffix if not present for API call
      const fullSymbol = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI analysis request timed out after 30 seconds')), this.API_TIMEOUT)
      );

      const response = await Promise.race([
        ApiClient.analyzeSymbol(fullSymbol),
        timeoutPromise
      ]) as any;

      console.log(`📡 AI analysis response for ${symbol}:`, response);

      // Simple validation: if backend returns success and has ANY meaningful data, display it
      if (response.success && response.data && response.data.analysis) {
        const rawResponse = response.data.analysis;
        console.log(`✅ AI analysis completed for ${symbol}:`, rawResponse);

        // User-friendly approach: if we have EITHER Reason OR SuggestedStrategy, show the analysis
        if (AIResponseValidator.hasUsefulData(rawResponse)) {
          console.log(`🚀 Useful data found, enhancing analysis for ${symbol}`);

          // Enhance the analysis data with derived technical indicators
          const enhancedData = await this.deriveAdditionalData(symbol, rawResponse);

          const analysisData: AnalysisDataWithQuality = {
            ...enhancedData,
            _dataQuality: 'ai-generated',
            _timestamp: Date.now(),
            _retryCount: 0
          };

          console.log(`✅ Enhanced AI analysis displayed successfully for ${symbol}`);
          return analysisData;
        }
      }

      // If we get here, the response was not useful
      console.error(`❌ No useful AI analysis data for ${symbol}:`, response);
      throw new Error('AI analysis returned no useful data. Please try again later.');

    } catch (error) {
      const apiError = handleApiError(error);
      logError(apiError, 'AI Analysis');
      throw apiError;
    }
  }

  /**
   * Enhanced data derivation system
   * Fetches market data and enhances AI analysis with technical indicators
   * @param symbol - The cryptocurrency symbol
   * @param analysisData - The raw analysis data to enhance
   * @returns Promise<AnalysisData> - Enhanced analysis data
   */
  static async deriveAdditionalData(symbol: string, analysisData: any): Promise<AnalysisData> {
    try {
      // Fetch market data from backend to get technical analysis
      const fullSymbol = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;
      const response = await fetch(`${this.API_BASE_URL}/api/market/ticker/${fullSymbol}`);

      if (response.ok) {
        const marketData: MarketDataResponse = await response.json();

        // Try to get TA data from current market data
        let ta: TechnicalAnalysisData | null = null;
        if (marketData.success && marketData.data?.historicalData) {
          const historicalData = marketData.data.historicalData;
          console.log(`📊 Historical data for ${symbol}:`, {
            priceHistoryLength: historicalData.priceHistory?.length || 0,
            volumeHistoryLength: historicalData.volumeHistory?.length || 0,
            timestampsLength: historicalData.timestamps?.length || 0
          });

          if (historicalData.priceHistory && historicalData.priceHistory.length >= 14) {
            const priceHistory = historicalData.priceHistory;
            const currentPrice = priceHistory[priceHistory.length - 1];

            // Calculate technical indicators
            const sma = priceHistory.slice(-60).reduce((a: number, b: number) => a + b, 0) / Math.min(60, priceHistory.length);
            const rsi = this.calculateRSI(priceHistory.slice(-14));
            const high = Math.max(...priceHistory.slice(-20));
            const low = Math.min(...priceHistory.slice(-20));

            ta = {
              sma,
              rsi,
              high,
              low,
              priceVsSma: currentPrice > sma ? 'Above' : 'Below',
              bollingerBands: this.calculateBollingerBands(priceHistory.slice(-20), sma)
            };

            console.log(`✅ Calculated TA for ${symbol}:`, ta);
          } else {
            console.log(`⚠️ Insufficient price history for ${symbol}: ${historicalData.priceHistory?.length || 0} points`);
          }
        }

        if (ta) {
          console.log(`📊 Enhanced data available for ${symbol}:`, ta);

          // Derive missing MACD data from available indicators
          if (!analysisData.TechnicalIndicators?.MACD && ta.rsi && ta.sma) {
            const derivedMACD = this.deriveMACDFromRSI(ta.rsi, ta.sma, ta.priceVsSma);
            analysisData.TechnicalIndicators = analysisData.TechnicalIndicators || {};
            analysisData.TechnicalIndicators.MACD = derivedMACD;
          }

          // Enhance Bollinger Bands data
          if (!analysisData.TechnicalIndicators?.BollingerBands && ta.bollingerBands) {
            analysisData.TechnicalIndicators = analysisData.TechnicalIndicators || {};
            analysisData.TechnicalIndicators.BollingerBands = {
              Status: this.deriveBollingerStatus(parseFloat(ta.bollingerBands.upper), parseFloat(ta.bollingerBands.lower), ta.sma),
              PricePosition: ta.priceVsSma === 'Above' ? 'Above Middle Band' : 'Below Middle Band',
              UpperBand: ta.bollingerBands.upper,
              LowerBand: ta.bollingerBands.lower,
              MiddleBand: ta.bollingerBands.middle
            };
          }

          // Enhance Volume data from market data
          if (marketData.data?.volume24h) {
            analysisData.TechnicalIndicators = analysisData.TechnicalIndicators || {};
            analysisData.TechnicalIndicators.Volume = {
              CurrentVolume: marketData.data.volume24h.toString(),
              Status: this.deriveVolumeStatus(marketData.data.volume24h),
              Interpretation: 'Volume analysis based on 24h trading data'
            };
            console.log(`✅ Enhanced volume data for ${symbol}:`, analysisData.TechnicalIndicators.Volume);
          } else {
            console.log(`⚠️ No volume24h data available for ${symbol}`);
          }

          // Enhance price action data
          if (!analysisData.PriceAction?.CurrentPrice && ta.sma) {
            analysisData.PriceAction = analysisData.PriceAction || {};
            analysisData.PriceAction.CurrentPrice = `$${ta.sma.toFixed(4)}`;
            analysisData.PriceAction.RecentHigh = `$${ta.high.toFixed(4)}`;
            analysisData.PriceAction.RecentLow = `$${ta.low.toFixed(4)}`;

            // Calculate support and resistance levels
            const supportResistance = this.calculateSupportResistance(ta.high, ta.low, ta.sma);
            analysisData.PriceAction.KeySupport = supportResistance.support;
            analysisData.PriceAction.KeyResistance = supportResistance.resistance;
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Could not enhance data for ${symbol}:`, error);
    }

    return analysisData;
  }

  /**
   * Derive MACD-like signal from RSI and SMA
   * @param rsi - RSI value
   * @param sma - Simple Moving Average
   * @param priceVsSma - Price position relative to SMA
   * @returns MACD-like data object
   */
  private static deriveMACDFromRSI(rsi: number, _sma: number, priceVsSma: string) {
    let status = 'Neutral';
    let interpretation = 'MACD signal derived from RSI and SMA analysis';

    if (rsi > 70 && priceVsSma === 'Above') {
      status = 'Bullish Divergence';
      interpretation = 'Strong bullish momentum indicated by high RSI and price above SMA';
    } else if (rsi < 30 && priceVsSma === 'Below') {
      status = 'Bearish Divergence';
      interpretation = 'Strong bearish momentum indicated by low RSI and price below SMA';
    } else if (rsi > 50 && priceVsSma === 'Above') {
      status = 'Bullish';
      interpretation = 'Moderate bullish momentum';
    } else if (rsi < 50 && priceVsSma === 'Below') {
      status = 'Bearish';
      interpretation = 'Moderate bearish momentum';
    }

    return {
      Status: status,
      Interpretation: interpretation,
      Signal: rsi > 50 ? 'BUY' : 'SELL',
      Confidence: Math.abs(rsi - 50) / 50 * 100 // Convert RSI distance from neutral to confidence
    };
  }

  /**
   * Derive Bollinger Band status
   * @param upper - Upper Bollinger Band
   * @param lower - Lower Bollinger Band
   * @param currentPrice - Current price
   * @returns Status string
   */
  private static deriveBollingerStatus(upper: number, lower: number, currentPrice: number): string {
    const bandWidth = upper - lower;
    const pricePosition = (currentPrice - lower) / bandWidth;

    if (pricePosition > 0.8) return 'Near Upper Band - Potential Resistance';
    if (pricePosition < 0.2) return 'Near Lower Band - Potential Support';
    return 'Within Normal Range';
  }

  /**
   * Calculate support and resistance levels using Fibonacci retracements
   * @param high - Recent high price
   * @param low - Recent low price
   * @param sma - Simple moving average
   * @returns Support and resistance levels
   */
  private static calculateSupportResistance(high: number, low: number, sma: number): SupportResistanceData {
    const range = high - low;
    const support = (low + (range * 0.236)).toFixed(4); // Fibonacci 23.6% retracement
    const resistance = (high - (range * 0.236)).toFixed(4); // Fibonacci 23.6% from high

    return {
      support,
      resistance,
      confidence: range > 0 ? Math.min(range / sma * 100, 100) : 50 // Confidence based on range relative to SMA
    };
  }

  /**
   * Simple RSI calculation
   * @param prices - Array of price values
   * @param period - RSI period (default: 14)
   * @returns RSI value
   */
  private static calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50; // Default neutral RSI

    let gains = 0;
    let losses = 0;

    for (let i = 1; i < period + 1; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * Simple Bollinger Bands calculation
   * @param prices - Array of price values
   * @param sma - Simple moving average
   * @returns Bollinger Bands data
   */
  private static calculateBollingerBands(prices: number[], sma: number) {
    if (prices.length < 20) return { upper: '0', middle: '0', lower: '0' };

    const variance = prices.reduce((sum: number, price: number) => sum + Math.pow(price - sma, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);

    return {
      upper: (sma + (stdDev * 2)).toFixed(4),
      middle: sma.toFixed(4),
      lower: (sma - (stdDev * 2)).toFixed(4)
    };
  }

  /**
   * Derives volume status from 24h volume data
   * @param volume24h - 24 hour trading volume
   * @returns Volume status string
   */
  private static deriveVolumeStatus(volume24h: number): string {
    // Simple volume analysis based on magnitude
    if (volume24h > 100000000) { // > 100M
      return 'High Volume - Strong Interest';
    } else if (volume24h > 50000000) { // > 50M
      return 'Moderate Volume';
    } else if (volume24h > 10000000) { // > 10M
      return 'Average Volume';
    } else {
      return 'Low Volume';
    }
  }

  /**
   * Validates if the analysis data has useful information
   * @param data - Analysis data to validate
   * @returns boolean indicating if data is useful
   */
  static hasUsefulData(data: any): boolean {
    return AIResponseValidator.hasUsefulData(data);
  }

  /**
   * Creates a manual refresh handler
   * @param symbol - Symbol to refresh
   * @param onSuccess - Success callback
   * @param onError - Error callback
   * @returns Refresh function
   */
  static createRefreshHandler(
    symbol: string,
    onSuccess: (data: AnalysisDataWithQuality) => void,
    onError: (error: string) => void
  ) {
    return async () => {
      try {
        const data = await this.fetchAIAnalysis(symbol);
        if (data) {
          onSuccess(data);
        } else {
          onError('No analysis data received');
        }
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    };
  }
}