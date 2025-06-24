import { TA_CONFIG } from '@/config/constants.js';
export class TechnicalAnalysisService {
    static sma(data, period) {
        if (!data || data.length < period) {
            return null;
        }
        const slice = data.slice(-period);
        const sum = slice.reduce((acc, val) => acc + val, 0);
        return sum / period;
    }
    static rsi(data, period = TA_CONFIG.RSI_PERIOD) {
        if (!data || data.length < period + 1) {
            return null;
        }
        let gains = 0;
        let losses = 0;
        for (let i = data.length - period; i < data.length; i++) {
            const diff = data[i] - data[i - 1];
            if (diff > 0) {
                gains += diff;
            }
            else {
                losses -= diff;
            }
        }
        if (gains === 0)
            return 0;
        if (losses === 0)
            return 100;
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    static bollingerBands(data, period, stdDev = TA_CONFIG.BBANDS_STD_DEV) {
        if (!data || data.length < period) {
            return null;
        }
        const middle = this.sma(data, period);
        if (middle === null) {
            return null;
        }
        const slice = data.slice(-period);
        const variance = slice
            .map(n => Math.pow(n - middle, 2))
            .reduce((a, b) => a + b) / period;
        const standardDeviation = Math.sqrt(variance);
        const upper = middle + (standardDeviation * stdDev);
        const lower = middle - (standardDeviation * stdDev);
        return {
            upper,
            middle,
            lower
        };
    }
    static findRecentHigh(data) {
        if (!data || data.length === 0) {
            throw new Error('Cannot find high of empty data array');
        }
        return Math.max(...data);
    }
    static findRecentLow(data) {
        if (!data || data.length === 0) {
            throw new Error('Cannot find low of empty data array');
        }
        return Math.min(...data);
    }
    static calculateCompleteTA(priceHistory, currentPrice) {
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
    static validateData(data, minLength = 1) {
        return Array.isArray(data) &&
            data.length >= minLength &&
            data.every(val => typeof val === 'number' && !isNaN(val));
    }
}
export const taService = TechnicalAnalysisService;
//# sourceMappingURL=technicalAnalysis.js.map