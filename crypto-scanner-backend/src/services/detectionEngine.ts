/**
 * Pump & Dump Detection Engine
 * Extracted from legacy crypto_scanner.js lines 138-165
 * 
 * Core detection algorithm that analyzes price and volume data to identify:
 * - PUMP signals (price + volume anomalies)
 * - STRONG_PUMP signals (extreme price + volume anomalies)
 * - DUMP signals (significant price drops)
 * - NEUTRAL signals (normal market behavior)
 * - GATHERING_DATA (insufficient data for analysis)
 */

import { TechnicalAnalysisService } from './technicalAnalysis.js';
import { 
  DETECTION_CONFIG, 
  TA_CONFIG, 
  SIGNAL_TYPES,
  type DetectionSettings,
  type SignalType 
} from '@/config/constants.js';

/**
 * Detection input data interface
 */
export interface DetectionData {
  priceHistory: number[];
  volumePerSecondHistory: number[];
  currentPrice: number;
  currentVolumePerSecond: number;
}

/**
 * Detection result interface
 */
export interface DetectionResult {
  signal: SignalType;
  confidence: number;
  metadata: {
    priceMA: number | null;
    volumeMA: number | null;
    effectiveEpsPrice: number;
    isPriceAnomaly: boolean;
    isVolumeAnomaly: boolean;
    priceChange?: number;
    model: string;
  };
}

/**
 * Pump & Dump Detection Engine Class
 * Contains the core detection algorithm with all three models
 */
export class DetectionEngine {
  /**
   * Main detection function
   * Extracted from legacy lines 138-165
   * 
   * @param data - Market data for analysis
   * @param settings - Detection settings (sensitivity, model)
   * @returns Detection result with signal type and metadata
   */
  static detectPumpAndDump(data: DetectionData, settings: DetectionSettings): DetectionResult {
    const { priceHistory, volumePerSecondHistory, currentPrice, currentVolumePerSecond } = data;
    const { eps_price, eps_volume, model } = settings;

    // Check if we have sufficient data for analysis (legacy line 141)
    if (priceHistory.length < TA_CONFIG.MA_PERIOD || volumePerSecondHistory.length < TA_CONFIG.MA_PERIOD) {
      return {
        signal: SIGNAL_TYPES.GATHERING_DATA,
        confidence: 0,
        metadata: {
          priceMA: null,
          volumeMA: null,
          effectiveEpsPrice: eps_price,
          isPriceAnomaly: false,
          isVolumeAnomaly: false,
          model
        }
      };
    }

    // Calculate moving averages (legacy lines 143-144)
    const priceMA = TechnicalAnalysisService.sma(priceHistory, TA_CONFIG.MA_PERIOD);
    const volumePerSecondMA = TechnicalAnalysisService.sma(volumePerSecondHistory, TA_CONFIG.MA_PERIOD);

    // Validate moving averages (legacy line 146)
    if (priceMA === null || volumePerSecondMA === null || volumePerSecondMA === 0) {
      return {
        signal: SIGNAL_TYPES.GATHERING_DATA,
        confidence: 0,
        metadata: {
          priceMA,
          volumeMA: volumePerSecondMA,
          effectiveEpsPrice: eps_price,
          isPriceAnomaly: false,
          isVolumeAnomaly: false,
          model
        }
      };
    }

    // Apply model-specific sensitivity adjustments (legacy lines 148-150)
    const effectiveEpsPrice = this.calculateEffectiveEpsPrice(eps_price, model);

    // Detect price and volume anomalies (legacy lines 152-153)
    const isPriceAnomaly = currentPrice > (priceMA * effectiveEpsPrice);
    const isVolumeAnomaly = currentVolumePerSecond > (volumePerSecondMA * eps_volume);

    // Check for PUMP signals (legacy lines 155-158)
    if (isPriceAnomaly && isVolumeAnomaly) {
      // Check for STRONG_PUMP (legacy line 156)
      const strongPumpThreshold = effectiveEpsPrice + DETECTION_CONFIG.STRONG_PUMP_THRESHOLD;
      if (currentPrice > (priceMA * strongPumpThreshold)) {
        return {
          signal: SIGNAL_TYPES.STRONG_PUMP,
          confidence: this.calculateConfidence(currentPrice, priceMA, effectiveEpsPrice, true),
          metadata: {
            priceMA,
            volumeMA: volumePerSecondMA,
            effectiveEpsPrice,
            isPriceAnomaly,
            isVolumeAnomaly,
            model
          }
        };
      }

      return {
        signal: SIGNAL_TYPES.PUMP,
        confidence: this.calculateConfidence(currentPrice, priceMA, effectiveEpsPrice, false),
        metadata: {
          priceMA,
          volumeMA: volumePerSecondMA,
          effectiveEpsPrice,
          isPriceAnomaly,
          isVolumeAnomaly,
          model
        }
      };
    }

    // Check for DUMP signals (legacy lines 160-162)
    if (priceHistory.length >= 2) {
      const previousPrice = priceHistory[priceHistory.length - 2]!;
      const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
      
      if (priceChange < DETECTION_CONFIG.DUMP_THRESHOLD) {
        return {
          signal: SIGNAL_TYPES.DUMP,
          confidence: Math.abs(priceChange) / 10, // Convert to 0-1 scale
          metadata: {
            priceMA,
            volumeMA: volumePerSecondMA,
            effectiveEpsPrice,
            isPriceAnomaly,
            isVolumeAnomaly,
            priceChange,
            model
          }
        };
      }
    }

    // Default to NEUTRAL (legacy line 164)
    return {
      signal: SIGNAL_TYPES.NEUTRAL,
      confidence: 0.5,
      metadata: {
        priceMA,
        volumeMA: volumePerSecondMA,
        effectiveEpsPrice,
        isPriceAnomaly,
        isVolumeAnomaly,
        model
      }
    };
  }

  /**
   * Calculate effective price sensitivity based on detection model
   * Extracted from legacy lines 148-150
   * 
   * @param eps_price - Base price sensitivity
   * @param model - Detection model
   * @returns Adjusted price sensitivity
   */
  private static calculateEffectiveEpsPrice(eps_price: number, model: string): number {
    const multiplier = DETECTION_CONFIG.MODEL_MULTIPLIERS[model as keyof typeof DETECTION_CONFIG.MODEL_MULTIPLIERS] || 1.0;
    return 1 + ((eps_price - 1) * multiplier);
  }

  /**
   * Calculate confidence score for detection
   * 
   * @param currentPrice - Current price
   * @param priceMA - Price moving average
   * @param effectiveEpsPrice - Effective price sensitivity
   * @param isStrongPump - Whether this is a strong pump
   * @returns Confidence score (0-1)
   */
  private static calculateConfidence(
    currentPrice: number, 
    priceMA: number, 
    effectiveEpsPrice: number,
    isStrongPump: boolean
  ): number {
    const priceRatio = currentPrice / priceMA;
    const baseConfidence = Math.min((priceRatio - effectiveEpsPrice) / effectiveEpsPrice, 1.0);
    return isStrongPump ? Math.min(baseConfidence * 1.2, 1.0) : baseConfidence;
  }

  /**
   * Validate detection input data
   * 
   * @param data - Detection data to validate
   * @returns true if data is valid
   */
  static validateDetectionData(data: DetectionData): boolean {
    const { priceHistory, volumePerSecondHistory, currentPrice, currentVolumePerSecond } = data;
    
    return (
      Array.isArray(priceHistory) &&
      Array.isArray(volumePerSecondHistory) &&
      typeof currentPrice === 'number' &&
      typeof currentVolumePerSecond === 'number' &&
      !isNaN(currentPrice) &&
      !isNaN(currentVolumePerSecond) &&
      currentPrice > 0 &&
      currentVolumePerSecond >= 0 &&
      priceHistory.every(price => typeof price === 'number' && !isNaN(price) && price > 0) &&
      volumePerSecondHistory.every(vol => typeof vol === 'number' && !isNaN(vol) && vol >= 0)
    );
  }

  /**
   * Validate detection settings
   * 
   * @param settings - Detection settings to validate
   * @returns true if settings are valid
   */
  static validateDetectionSettings(settings: DetectionSettings): boolean {
    const { eps_price, eps_volume, model } = settings;
    
    return (
      typeof eps_price === 'number' &&
      typeof eps_volume === 'number' &&
      typeof model === 'string' &&
      eps_price > 1.0 &&
      eps_volume > 1.0 &&
      Object.keys(DETECTION_CONFIG.MODEL_MULTIPLIERS).includes(model)
    );
  }
}

// Export singleton instance for convenience
export const detectionEngine = DetectionEngine;
