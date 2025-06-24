export interface BollingerBands {
    upper: number;
    middle: number;
    lower: number;
}
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
export declare class TechnicalAnalysisService {
    static sma(data: number[], period: number): number | null;
    static rsi(data: number[], period?: number): number | null;
    static bollingerBands(data: number[], period: number, stdDev?: number): BollingerBands | null;
    static findRecentHigh(data: number[]): number;
    static findRecentLow(data: number[]): number;
    static calculateCompleteTA(priceHistory: number[], currentPrice: number): TechnicalAnalysisData | null;
    static validateData(data: number[], minLength?: number): boolean;
}
export declare const taService: typeof TechnicalAnalysisService;
//# sourceMappingURL=technicalAnalysis.d.ts.map