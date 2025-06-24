/**
 * Gemini AI Service
 * Extracted from legacy crypto_scanner.js lines 167-202
 * 
 * Provides AI-powered market analysis using Google's Gemini API
 * Generates detailed technical analysis reports and trading strategies
 */

import fetch from 'node-fetch';
import { GEMINI_CONFIG, TA_CONFIG } from '@/config/constants.js';
import type { CryptoData } from './binanceService.js';
import type { DetectionSettings } from '@/config/constants.js';

/**
 * Gemini API request payload interface
 */
interface GeminiPayload {
  contents: Array<{
    role: string;
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig: {
    responseMimeType: string;
    responseSchema: any;
  };
}

/**
 * Enhanced AI Analysis result interface with detailed technical indicators
 * Enhanced from legacy JSON schema for actionable trading intelligence
 */
export interface AIAnalysisResult {
  Reason: string;
  PriceAction: {
    CurrentPrice: string;
    RecentHigh: string;
    RecentLow: string;
    KeySupport: string;
    KeyResistance: string;
    PriceAnalysis: string;
  };
  TechnicalIndicators: {
    RSI: {
      CurrentRSI: string;
      Status: string;
      Interpretation: string;
    };
    MACD: {
      MACDLine: string;
      SignalLine: string;
      Status: string;
      Interpretation: string;
    };
    MovingAverages: {
      MA7: string;
      MA25: string;
      PricePosition: string;
      Trend: string;
    };
    BollingerBands: {
      Upper: string;
      Middle: string;
      Lower: string;
      PricePosition: string;
      Status: string;
    };
    Volume: {
      Current24h: string;
      Average: string;
      Change: string;
      Status: string;
    };
  };
  SuggestedStrategy: string;
  BullishScenario: string;
  BearishScenario: string;
  ConfidenceScore: string;
  RiskWarning: string;
}

/**
 * Analysis request interface
 */
export interface AnalysisRequest {
  coin: CryptoData;
  settings: DetectionSettings;
}

/**
 * Gemini AI Service Class
 * Handles all AI analysis functionality
 */
export class GeminiService {
  private static requestCount = 0;
  private static lastRequestTime = 0;
  private static readonly RATE_LIMIT_DELAY = 1000; // 1 second between requests

  /**
   * Generate advanced AI analysis for a cryptocurrency
   * Extracted from legacy lines 167-202
   * 
   * @param coin - Cryptocurrency data
   * @param settings - Detection settings
   * @returns AI analysis result or error fallback
   */
  static async getAdvancedAnalysis(coin: CryptoData, settings: DetectionSettings): Promise<AIAnalysisResult> {
    // Validate API key
    if (!GEMINI_CONFIG.API_KEY) {
      return this.createErrorResponse('Gemini API key not configured');
    }

    // Validate input data
    if (!coin.ta) {
      return this.createErrorResponse('Technical analysis data not available');
    }

    try {
      // Rate limiting
      await this.enforceRateLimit();

      // Create the analysis prompt (legacy lines 170-184)
      const prompt = this.createAnalysisPrompt(coin, settings);
      
      // Create JSON schema (legacy line 169)
      const jsonSchema = this.createResponseSchema();

      // Create API payload (legacy lines 186-189)
      const payload: GeminiPayload = {
        contents: [{ 
          role: "user", 
          parts: [{ text: prompt }] 
        }],
        generationConfig: { 
          responseMimeType: "application/json", 
          responseSchema: jsonSchema 
        }
      };

      // Make API request (legacy lines 191-194)
      const apiUrl = `${GEMINI_CONFIG.API_URL}?key=${GEMINI_CONFIG.API_KEY}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gemini API error! status: ${response.status}`);
      }

      // Parse response (legacy lines 195-197)
      const result = await response.json() as any;
      const jsonString = result.candidates[0].content.parts[0].text.replace(/```json\n|```/g, '');
      
      return JSON.parse(jsonString) as AIAnalysisResult;

    } catch (error) {
      console.error("Error calling or parsing Gemini API:", error);
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  /**
   * Create enhanced analysis prompt for Gemini API with specific actionable requirements
   * Enhanced from legacy lines 170-184 for detailed technical analysis
   */
  private static createAnalysisPrompt(coin: CryptoData, settings: DetectionSettings): string {
    const { symbol, price, priceChangePercent, volume, signal, ta } = coin;

    // Calculate support/resistance levels for prompt context
    const supportLevel = (price * 0.95).toFixed(6);
    const resistanceLevel = (price * 1.05).toFixed(6);

    return `Act as a professional crypto market analyst providing actionable trading intelligence for ${symbol.replace('USDT', '')}. The system detected a "${signal.replace('_', ' ')}" signal using the "${settings.model}" model.

CRITICAL: Provide SPECIFIC, ACTIONABLE analysis with concrete data points. Avoid generic statements like "mixed signals" or "requires analysis."

Market Data:
- Current Price: ${price} USD
- 24h Price Change: ${priceChangePercent}%
- 24h Volume: ${volume} USDT
- Short-Term SMA (${TA_CONFIG.MA_PERIOD}-tick): ${ta.sma}
- Price vs SMA: ${ta.priceVsSma}
- Recent High (${TA_CONFIG.DATA_HISTORY_LENGTH}-tick): ${ta.high}
- Recent Low (${TA_CONFIG.DATA_HISTORY_LENGTH}-tick): ${ta.low}
- RSI (${TA_CONFIG.RSI_PERIOD}-tick): ${ta.rsi}
- Bollinger Bands: Upper=${ta.bollingerBands.upper}, Middle=${ta.bollingerBands.middle}, Lower=${ta.bollingerBands.lower}
- Volume Spike vs MA: ${settings.eps_volume}x

REQUIREMENTS:
1. Reason: Include specific RSI value, MA position, and volume analysis with concrete interpretations
2. Support/Resistance: Calculate and provide specific price levels with breakout scenarios
3. Technical Indicators: Provide status indicators (↗️ Bullish, ↘️ Bearish, ➡️ Neutral) for each indicator
4. Trading Scenarios: Give specific "If price breaks X, then target Y" scenarios with stop-loss levels
5. Confidence Score: Provide percentage confidence for next 4-hour direction
6. No generic advice - be specific and actionable for professional traders

Populate the JSON object with detailed, specific analysis. Do not use placeholder text or generic statements.`;
  }

  /**
   * Create enhanced JSON response schema for Gemini API
   * Enhanced from legacy line 169 for detailed technical analysis
   */
  private static createResponseSchema(): any {
    return {
      type: "OBJECT",
      properties: {
        "Reason": { "type": "STRING" },
        "PriceAction": {
          "type": "OBJECT",
          "properties": {
            "CurrentPrice": { "type": "STRING" },
            "RecentHigh": { "type": "STRING" },
            "RecentLow": { "type": "STRING" },
            "KeySupport": { "type": "STRING" },
            "KeyResistance": { "type": "STRING" },
            "PriceAnalysis": { "type": "STRING" }
          }
        },
        "TechnicalIndicators": {
          "type": "OBJECT",
          "properties": {
            "RSI": {
              "type": "OBJECT",
              "properties": {
                "CurrentRSI": { "type": "STRING" },
                "Status": { "type": "STRING" },
                "Interpretation": { "type": "STRING" }
              }
            },
            "MACD": {
              "type": "OBJECT",
              "properties": {
                "MACDLine": { "type": "STRING" },
                "SignalLine": { "type": "STRING" },
                "Status": { "type": "STRING" },
                "Interpretation": { "type": "STRING" }
              }
            },
            "MovingAverages": {
              "type": "OBJECT",
              "properties": {
                "MA7": { "type": "STRING" },
                "MA25": { "type": "STRING" },
                "PricePosition": { "type": "STRING" },
                "Trend": { "type": "STRING" }
              }
            },
            "BollingerBands": {
              "type": "OBJECT",
              "properties": {
                "Upper": { "type": "STRING" },
                "Middle": { "type": "STRING" },
                "Lower": { "type": "STRING" },
                "PricePosition": { "type": "STRING" },
                "Status": { "type": "STRING" }
              }
            },
            "Volume": {
              "type": "OBJECT",
              "properties": {
                "Current24h": { "type": "STRING" },
                "Average": { "type": "STRING" },
                "Change": { "type": "STRING" },
                "Status": { "type": "STRING" }
              }
            }
          }
        },
        "SuggestedStrategy": { "type": "STRING" },
        "BullishScenario": { "type": "STRING" },
        "BearishScenario": { "type": "STRING" },
        "ConfidenceScore": { "type": "STRING" },
        "RiskWarning": { "type": "STRING" }
      }
    };
  }

  /**
   * Create enhanced error response fallback
   * Enhanced from legacy lines 199-200 with detailed structure
   */
  private static createErrorResponse(errorMessage: string): AIAnalysisResult {
    return {
      Reason: `AI analysis temporarily unavailable: ${errorMessage}. Using fallback technical assessment.`,
      PriceAction: {
        CurrentPrice: "Price data updating...",
        RecentHigh: "High data updating...",
        RecentLow: "Low data updating...",
        KeySupport: "Support level calculating...",
        KeyResistance: "Resistance level calculating...",
        PriceAnalysis: "Price action analysis temporarily unavailable due to API error"
      },
      TechnicalIndicators: {
        RSI: {
          CurrentRSI: "50.0",
          Status: "➡️ Neutral",
          Interpretation: "RSI data temporarily unavailable"
        },
        MACD: {
          MACDLine: "MACD data updating...",
          SignalLine: "Signal line updating...",
          Status: "➡️ Neutral",
          Interpretation: "MACD analysis temporarily unavailable"
        },
        MovingAverages: {
          MA7: "MA7 calculating...",
          MA25: "MA25 calculating...",
          PricePosition: "Position analysis updating...",
          Trend: "➡️ Neutral"
        },
        BollingerBands: {
          Upper: "Upper band calculating...",
          Middle: "Middle band calculating...",
          Lower: "Lower band calculating...",
          PricePosition: "Band position updating...",
          Status: "➡️ Neutral"
        },
        Volume: {
          Current24h: "Volume data updating...",
          Average: "Average calculating...",
          Change: "Change calculating...",
          Status: "➡️ Neutral"
        }
      },
      SuggestedStrategy: "AI strategy analysis temporarily unavailable. Exercise caution and conduct manual technical analysis before making trading decisions.",
      BullishScenario: "Bullish scenario analysis temporarily unavailable due to API error.",
      BearishScenario: "Bearish scenario analysis temporarily unavailable due to API error.",
      ConfidenceScore: "0% - Analysis Unavailable",
      RiskWarning: "AI analysis could not be completed. Exercise extreme caution and conduct comprehensive manual analysis before making any trading decisions."
    };
  }

  /**
   * Enforce rate limiting to prevent API abuse
   */
  private static async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const waitTime = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Get API usage statistics
   */
  static getUsageStats(): { requestCount: number; lastRequestTime: number } {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime
    };
  }

  /**
   * Check if API is configured
   */
  static isConfigured(): boolean {
    return !!GEMINI_CONFIG.API_KEY;
  }
}

// Export singleton instance for convenience
export const geminiService = GeminiService;
