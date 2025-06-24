import { type DetectionSettings, type SignalType } from '@/config/constants.js';
export interface DetectionData {
    priceHistory: number[];
    volumePerSecondHistory: number[];
    currentPrice: number;
    currentVolumePerSecond: number;
}
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
export declare class DetectionEngine {
    static detectPumpAndDump(data: DetectionData, settings: DetectionSettings): DetectionResult;
    private static calculateEffectiveEpsPrice;
    private static calculateConfidence;
    static validateDetectionData(data: DetectionData): boolean;
    static validateDetectionSettings(settings: DetectionSettings): boolean;
}
export declare const detectionEngine: typeof DetectionEngine;
//# sourceMappingURL=detectionEngine.d.ts.map