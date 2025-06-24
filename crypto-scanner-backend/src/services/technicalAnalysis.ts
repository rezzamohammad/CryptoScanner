/**
 * Technical Analysis Service
 * Extracted from legacy crypto_scanner.js lines 108-136
 * 
 * Provides technical analysis calculations including:
 * - Simple Moving Average (SMA)
 * - Relative Strength Index (RSI)
 * - Bollinger Bands
 * - High/Low detection
 */

import { TA_CONFIG } from '@/config/constants.js';

/**
 * Bollinger Bands result interface
 */
export interface BollingerBands {
  upper: number;
  middle: number;
  lower: number;
}

/**
 * Complete Technical Analysis data interface
 */
export interface TechnicalAnalysisData {
  sma: number;
  rsi: number;
  high: number;
  low: number;
  priceVsSma: 'Above' | 'Below';
  bollingerBands: {
    upper: string;
    middle: string;
    lower: string;
  };
}

/**
 * Technical Analysis Service Class
 * Contains all technical analysis calculations
 */
export class TechnicalAnalysisService {
  /**
   * Calculate Simple Moving Average
   * Extracted from legacy lines 109-113
   * 
   * @param data - Array of price data
   * @param period - Period for moving average calculation
   * @returns SMA value or null if insufficient data
   */
  static sma(data: number[], period: number): number | null {
    if (!data || data.length < period) {
      return null;
    }
    
    const slice = data.slice(-period);
    const sum = slice.reduce((acc, val) => acc + val, 0);
    return sum / period;
  }

  /**
   * Calculate Relative Strength Index (RSI)
   * Extracted from legacy lines 114-125
   * 
   * @param data - Array of price data
   * @param period - Period for RSI calculation (default: 14)
   * @returns RSI value (0-100) or null if insufficient data
   */
  static rsi(data: number[], period: number = TA_CONFIG.RSI_PERIOD): number | null {
    if (!data || data.length < period + 1) {
      return null;
    }

    let gains = 0;
    let losses = 0;

    // Calculate gains and losses over the period
    for (let i = data.length - period; i < data.length; i++) {
      const diff = data[i]! - data[i - 1]!;
      if (diff > 0) {
        gains += diff;
      } else {
        losses -= diff; // Make losses positive
      }
    }

    // Handle edge cases
    if (gains === 0) return 0;
    if (losses === 0) return 100;

    // Calculate RSI
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    
    return 100 - (100 / (1 + rs));
  }

  /**
   * Calculate Bollinger Bands
   * Extracted from legacy lines 126-133
   * 
   * @param data - Array of price data
   * @param period - Period for calculation
   * @param stdDev - Standard deviation multiplier
   * @returns Bollinger Bands object or null if insufficient data
   */
  static bollingerBands(
    data: number[], 
    period: number, 
    stdDev: number = TA_CONFIG.BBANDS_STD_DEV
  ): BollingerBands | null {
    if (!data || data.length < period) {
      return null;
    }

    // Calculate middle band (SMA)
    const middle = this.sma(data, period);
    if (middle === null) {
      return null;
    }

    // Calculate standard deviation
    const slice = data.slice(-period);
    const variance = slice
      .map(n => Math.pow(n - middle, 2))
      .reduce((a, b) => a + b) / period;
    const standardDeviation = Math.sqrt(variance);

    // Calculate upper and lower bands
    const upper = middle + (standardDeviation * stdDev);
    const lower = middle - (standardDeviation * stdDev);

    return {
      upper,
      middle,
      lower
    };
  }

  /**
   * Find recent high in price data
   * Extracted from legacy line 134
   * 
   * @param data - Array of price data
   * @returns Maximum value in the array
   */
  static findRecentHigh(data: number[]): number {
    if (!data || data.length === 0) {
      throw new Error('Cannot find high of empty data array');
    }
    return Math.max(...data);
  }

  /**
   * Find recent low in price data
   * Extracted from legacy line 135
   * 
   * @param data - Array of price data
   * @returns Minimum value in the array
   */
  static findRecentLow(data: number[]): number {
    if (!data || data.length === 0) {
      throw new Error('Cannot find low of empty data array');
    }
    return Math.min(...data);
  }

  /**
   * Calculate complete technical analysis data
   * This combines all TA calculations similar to legacy lines 349-353
   * 
   * @param priceHistory - Array of historical prices
   * @param currentPrice - Current price for comparison
   * @returns Complete TA data or null if insufficient data
   */
  static calculateCompleteTA(
    priceHistory: number[], 
    currentPrice: number
  ): TechnicalAnalysisData | null {
    if (priceHistory.length < TA_CONFIG.MA_PERIOD) {
      return null;
    }

    const sma = this.sma(priceHistory, TA_CONFIG.MA_PERIOD);
    const rsi = this.rsi(priceHistory, TA_CONFIG.RSI_PERIOD);
    const bbands = this.bollingerBands(priceHistory, TA_CONFIG.BBANDS_PERIOD, TA_CONFIG.BBANDS_STD_DEV);

    if (!sma || rsi === null || !bbands) {
      return null;
    }

    return {
      sma,
      rsi: parseFloat(rsi.toFixed(1)),
      high: this.findRecentHigh(priceHistory),
      low: this.findRecentLow(priceHistory),
      priceVsSma: currentPrice > sma ? 'Above' : 'Below',
      bollingerBands: {
        upper: bbands.upper.toFixed(4),
        middle: bbands.middle.toFixed(4),
        lower: bbands.lower.toFixed(4)
      }
    };
  }

  /**
   * Validate input data for TA calculations
   * 
   * @param data - Array of numbers to validate
   * @param minLength - Minimum required length
   * @returns true if data is valid
   */
  static validateData(data: number[], minLength: number = 1): boolean {
    return Array.isArray(data) && 
           data.length >= minLength && 
           data.every(val => typeof val === 'number' && !isNaN(val));
  }
}

// Export singleton instance for convenience
export const taService = TechnicalAnalysisService;
