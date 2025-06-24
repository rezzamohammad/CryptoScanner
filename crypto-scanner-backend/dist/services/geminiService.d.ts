import type { CryptoData } from './binanceService.js';
import type { DetectionSettings } from '@/config/constants.js';
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
export interface AnalysisRequest {
    coin: CryptoData;
    settings: DetectionSettings;
}
export declare class GeminiService {
    private static requestCount;
    private static lastRequestTime;
    private static readonly RATE_LIMIT_DELAY;
    static getAdvancedAnalysis(coin: CryptoData, settings: DetectionSettings): Promise<AIAnalysisResult>;
    private static createAnalysisPrompt;
    private static createResponseSchema;
    private static createErrorResponse;
    private static enforceRateLimit;
    static getUsageStats(): {
        requestCount: number;
        lastRequestTime: number;
    };
    static isConfigured(): boolean;
}
export declare const geminiService: typeof GeminiService;
//# sourceMappingURL=geminiService.d.ts.map