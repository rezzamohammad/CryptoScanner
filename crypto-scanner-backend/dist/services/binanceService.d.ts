import { EventEmitter } from 'events';
import { type DetectionSettings } from '@/config/constants.js';
export interface BinanceTicker {
    s: string;
    c: string;
    P: string;
    v: string;
    q: string;
}
export interface CryptoData {
    symbol: string;
    price: number;
    priceChangePercent: number;
    volume: number;
    signal: string;
    priceHistory: number[];
    ta: any | null;
    lastUpdated: Date;
}
interface HistoricalData {
    priceHistory: number[];
    volumePerSecondHistory: number[];
    lastTotalVolume: number;
    lastTimestamp: number;
}
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
export declare class BinanceService extends EventEmitter {
    private ws;
    private connectionStatus;
    private dataHistory;
    private detectionSettings;
    private reconnectAttempts;
    private reconnectTimer;
    private currentMarketData;
    constructor();
    connect(): void;
    disconnect(): void;
    private processTickerData;
    updateDetectionSettings(settings: DetectionSettings): void;
    getDetectionSettings(): DetectionSettings;
    getConnectionStatus(): ConnectionStatus;
    getHistoricalData(symbol: string): HistoricalData | null;
    clearHistoricalData(): void;
    getCurrentCoinData(symbol: string): CryptoData | null;
    getAllCurrentData(): CryptoData[];
    private setConnectionStatus;
    private scheduleReconnect;
    isConnected(): boolean;
}
export declare const binanceService: BinanceService;
export {};
//# sourceMappingURL=binanceService.d.ts.map