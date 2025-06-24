import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { TechnicalAnalysisService } from './technicalAnalysis.js';
import { DetectionEngine } from './detectionEngine.js';
import { BINANCE_CONFIG, TA_CONFIG, DEFAULT_DETECTION_SETTINGS } from '@/config/constants.js';
export class BinanceService extends EventEmitter {
    ws = null;
    connectionStatus = 'disconnected';
    dataHistory = new Map();
    detectionSettings = DEFAULT_DETECTION_SETTINGS;
    reconnectAttempts = 0;
    reconnectTimer = null;
    currentMarketData = new Map();
    constructor() {
        super();
        this.setMaxListeners(100);
    }
    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }
        this.setConnectionStatus('connecting');
        this.ws = new WebSocket(BINANCE_CONFIG.WS_URL);
        this.ws.onopen = () => {
            this.setConnectionStatus('connected');
            this.reconnectAttempts = 0;
            this.emit('connected');
        };
        this.ws.onclose = () => {
            this.setConnectionStatus('disconnected');
            this.emit('disconnected');
            this.scheduleReconnect();
        };
        this.ws.onerror = (error) => {
            this.setConnectionStatus('error');
            this.emit('error', error);
            this.ws?.close();
        };
        this.ws.onmessage = (event) => {
            try {
                const tickers = JSON.parse(event.data.toString());
                this.processTickerData(tickers);
            }
            catch (error) {
                this.emit('error', new Error(`Failed to parse WebSocket message: ${error}`));
            }
        };
    }
    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.setConnectionStatus('disconnected');
    }
    processTickerData(tickers) {
        const processedCoins = new Map();
        const now = Date.now();
        for (const ticker of tickers) {
            if (!ticker.s.endsWith('USDT'))
                continue;
            const symbol = ticker.s;
            const newPrice = parseFloat(ticker.c);
            const newTotalVolume = parseFloat(ticker.v);
            const history = this.dataHistory.get(symbol) || {
                priceHistory: [],
                volumePerSecondHistory: [],
                lastTotalVolume: newTotalVolume,
                lastTimestamp: now - 1000
            };
            const timeDelta = Math.max(1, (now - history.lastTimestamp) / 1000);
            const volumeDelta = Math.max(0, newTotalVolume - history.lastTotalVolume);
            const volumePerSecond = volumeDelta / timeDelta;
            const newPriceHistory = [...history.priceHistory, newPrice].slice(-TA_CONFIG.DATA_HISTORY_LENGTH);
            const newVolumePerSecondHistory = [...history.volumePerSecondHistory, volumePerSecond].slice(-TA_CONFIG.DATA_HISTORY_LENGTH);
            this.dataHistory.set(symbol, {
                priceHistory: newPriceHistory,
                volumePerSecondHistory: newVolumePerSecondHistory,
                lastTotalVolume: newTotalVolume,
                lastTimestamp: now
            });
            const detectionData = {
                priceHistory: newPriceHistory,
                volumePerSecondHistory: newVolumePerSecondHistory,
                currentPrice: newPrice,
                currentVolumePerSecond: volumePerSecond
            };
            const detectionResult = DetectionEngine.detectPumpAndDump(detectionData, this.detectionSettings);
            let taData = null;
            if (newPriceHistory.length >= TA_CONFIG.MA_PERIOD) {
                taData = TechnicalAnalysisService.calculateCompleteTA(newPriceHistory, newPrice);
            }
            const coinData = {
                symbol,
                price: newPrice,
                priceChangePercent: parseFloat(ticker.P),
                volume: parseFloat(ticker.q),
                signal: detectionResult.signal,
                priceHistory: newPriceHistory.slice(-TA_CONFIG.SPARKLINE_DATA_LENGTH),
                ta: taData,
                lastUpdated: new Date()
            };
            processedCoins.set(symbol, coinData);
            this.currentMarketData.set(symbol, coinData);
        }
        this.emit('dataUpdate', Array.from(processedCoins.values()));
    }
    updateDetectionSettings(settings) {
        if (DetectionEngine.validateDetectionSettings(settings)) {
            this.detectionSettings = { ...settings };
            this.emit('settingsUpdated', this.detectionSettings);
        }
        else {
            throw new Error('Invalid detection settings provided');
        }
    }
    getDetectionSettings() {
        return { ...this.detectionSettings };
    }
    getConnectionStatus() {
        return this.connectionStatus;
    }
    getHistoricalData(symbol) {
        return this.dataHistory.get(symbol) || null;
    }
    clearHistoricalData() {
        this.dataHistory.clear();
        this.currentMarketData.clear();
        this.emit('dataCleared');
    }
    getCurrentCoinData(symbol) {
        return this.currentMarketData.get(symbol.toUpperCase()) || null;
    }
    getAllCurrentData() {
        return Array.from(this.currentMarketData.values());
    }
    setConnectionStatus(status) {
        if (this.connectionStatus !== status) {
            this.connectionStatus = status;
            this.emit('statusChange', status);
        }
    }
    scheduleReconnect() {
        if (this.reconnectAttempts >= BINANCE_CONFIG.MAX_RECONNECT_ATTEMPTS) {
            this.emit('maxReconnectAttemptsReached');
            return;
        }
        this.reconnectAttempts++;
        const delay = BINANCE_CONFIG.RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts - 1);
        this.reconnectTimer = setTimeout(() => {
            this.emit('reconnecting', this.reconnectAttempts);
            this.connect();
        }, delay);
    }
    isConnected() {
        return this.connectionStatus === 'connected';
    }
}
export const binanceService = new BinanceService();
//# sourceMappingURL=binanceService.js.map