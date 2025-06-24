import { TechnicalAnalysisService } from './technicalAnalysis.js';
import { DETECTION_CONFIG, TA_CONFIG, SIGNAL_TYPES } from '@/config/constants.js';
export class DetectionEngine {
    static detectPumpAndDump(data, settings) {
        const { priceHistory, volumePerSecondHistory, currentPrice, currentVolumePerSecond } = data;
        const { eps_price, eps_volume, model } = settings;
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
        const priceMA = TechnicalAnalysisService.sma(priceHistory, TA_CONFIG.MA_PERIOD);
        const volumePerSecondMA = TechnicalAnalysisService.sma(volumePerSecondHistory, TA_CONFIG.MA_PERIOD);
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
        const effectiveEpsPrice = this.calculateEffectiveEpsPrice(eps_price, model);
        const isPriceAnomaly = currentPrice > (priceMA * effectiveEpsPrice);
        const isVolumeAnomaly = currentVolumePerSecond > (volumePerSecondMA * eps_volume);
        if (isPriceAnomaly && isVolumeAnomaly) {
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
        if (priceHistory.length >= 2) {
            const previousPrice = priceHistory[priceHistory.length - 2];
            const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
            if (priceChange < DETECTION_CONFIG.DUMP_THRESHOLD) {
                return {
                    signal: SIGNAL_TYPES.DUMP,
                    confidence: Math.abs(priceChange) / 10,
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
    static calculateEffectiveEpsPrice(eps_price, model) {
        const multiplier = DETECTION_CONFIG.MODEL_MULTIPLIERS[model] || 1.0;
        return 1 + ((eps_price - 1) * multiplier);
    }
    static calculateConfidence(currentPrice, priceMA, effectiveEpsPrice, isStrongPump) {
        const priceRatio = currentPrice / priceMA;
        const baseConfidence = Math.min((priceRatio - effectiveEpsPrice) / effectiveEpsPrice, 1.0);
        return isStrongPump ? Math.min(baseConfidence * 1.2, 1.0) : baseConfidence;
    }
    static validateDetectionData(data) {
        const { priceHistory, volumePerSecondHistory, currentPrice, currentVolumePerSecond } = data;
        return (Array.isArray(priceHistory) &&
            Array.isArray(volumePerSecondHistory) &&
            typeof currentPrice === 'number' &&
            typeof currentVolumePerSecond === 'number' &&
            !isNaN(currentPrice) &&
            !isNaN(currentVolumePerSecond) &&
            currentPrice > 0 &&
            currentVolumePerSecond >= 0 &&
            priceHistory.every(price => typeof price === 'number' && !isNaN(price) && price > 0) &&
            volumePerSecondHistory.every(vol => typeof vol === 'number' && !isNaN(vol) && vol >= 0));
    }
    static validateDetectionSettings(settings) {
        const { eps_price, eps_volume, model } = settings;
        return (typeof eps_price === 'number' &&
            typeof eps_volume === 'number' &&
            typeof model === 'string' &&
            eps_price > 1.0 &&
            eps_volume > 1.0 &&
            Object.keys(DETECTION_CONFIG.MODEL_MULTIPLIERS).includes(model));
    }
}
export const detectionEngine = DetectionEngine;
//# sourceMappingURL=detectionEngine.js.map