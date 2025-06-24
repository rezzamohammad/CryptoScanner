/**
 * Binance WebSocket Service
 * Extracted from legacy crypto_scanner.js lines 310-365
 * 
 * Manages WebSocket connection to Binance and processes real-time market data
 * Handles data history management and real-time processing pipeline
 */

import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { TechnicalAnalysisService } from './technicalAnalysis.js';
import { DetectionEngine, type DetectionData } from './detectionEngine.js';
import { 
  BINANCE_CONFIG, 
  TA_CONFIG, 
  DEFAULT_DETECTION_SETTINGS,
  type DetectionSettings 
} from '@/config/constants.js';

/**
 * Binance ticker data interface (from WebSocket stream)
 */
export interface BinanceTicker {
  s: string;  // Symbol
  c: string;  // Close price
  P: string;  // Price change percent
  v: string;  // Volume
  q: string;  // Quote asset volume
}

/**
 * Processed cryptocurrency data interface
 */
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

/**
 * Historical data storage interface
 */
interface HistoricalData {
  priceHistory: number[];
  volumePerSecondHistory: number[];
  lastTotalVolume: number;
  lastTimestamp: number;
}

/**
 * Connection status type
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Binance WebSocket Service Class
 * Manages real-time data connection and processing
 */
export class BinanceService extends EventEmitter {
  private ws: WebSocket | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private dataHistory: Map<string, HistoricalData> = new Map();
  private detectionSettings: DetectionSettings = DEFAULT_DETECTION_SETTINGS;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private currentMarketData: Map<string, CryptoData> = new Map();

  constructor() {
    super();
    this.setMaxListeners(100); // Allow many listeners for different components
  }

  /**
   * Connect to Binance WebSocket stream
   * Extracted from legacy lines 310-314
   */
  public connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.setConnectionStatus('connecting');
    this.ws = new WebSocket(BINANCE_CONFIG.WS_URL);

    // Connection opened (legacy line 312)
    this.ws.onopen = () => {
      this.setConnectionStatus('connected');
      this.reconnectAttempts = 0;
      this.emit('connected');
    };

    // Connection closed (legacy line 313)
    this.ws.onclose = () => {
      this.setConnectionStatus('disconnected');
      this.emit('disconnected');
      this.scheduleReconnect();
    };

    // Connection error (legacy line 314)
    this.ws.onerror = (error: any) => {
      this.setConnectionStatus('error');
      this.emit('error', error);
      this.ws?.close();
    };

    // Message received - main data processing (legacy lines 315-359)
    this.ws.onmessage = (event: any) => {
      try {
        const tickers: BinanceTicker[] = JSON.parse(event.data.toString());
        this.processTickerData(tickers);
      } catch (error) {
        this.emit('error', new Error(`Failed to parse WebSocket message: ${error}`));
      }
    };
  }

  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
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

  /**
   * Process ticker data from Binance WebSocket
   * Extracted from legacy lines 316-359
   */
  private processTickerData(tickers: BinanceTicker[]): void {
    const processedCoins: Map<string, CryptoData> = new Map();
    const now = Date.now();

    for (const ticker of tickers) {
      // Filter only USDT pairs (legacy line 320)
      if (!ticker.s.endsWith('USDT')) continue;

      const symbol = ticker.s;
      const newPrice = parseFloat(ticker.c);
      const newTotalVolume = parseFloat(ticker.v);

      // Get or initialize historical data (legacy line 325)
      const history = this.dataHistory.get(symbol) || {
        priceHistory: [],
        volumePerSecondHistory: [],
        lastTotalVolume: newTotalVolume,
        lastTimestamp: now - 1000
      };

      // Calculate volume per second (legacy lines 327-329)
      const timeDelta = Math.max(1, (now - history.lastTimestamp) / 1000);
      const volumeDelta = Math.max(0, newTotalVolume - history.lastTotalVolume);
      const volumePerSecond = volumeDelta / timeDelta;

      // Update price and volume history (legacy lines 331-332)
      const newPriceHistory = [...history.priceHistory, newPrice].slice(-TA_CONFIG.DATA_HISTORY_LENGTH);
      const newVolumePerSecondHistory = [...history.volumePerSecondHistory, volumePerSecond].slice(-TA_CONFIG.DATA_HISTORY_LENGTH);

      // Update stored history (legacy lines 334-339)
      this.dataHistory.set(symbol, {
        priceHistory: newPriceHistory,
        volumePerSecondHistory: newVolumePerSecondHistory,
        lastTotalVolume: newTotalVolume,
        lastTimestamp: now
      });

      // Run detection algorithm (legacy lines 341-346)
      const detectionData: DetectionData = {
        priceHistory: newPriceHistory,
        volumePerSecondHistory: newVolumePerSecondHistory,
        currentPrice: newPrice,
        currentVolumePerSecond: volumePerSecond
      };

      const detectionResult = DetectionEngine.detectPumpAndDump(detectionData, this.detectionSettings);

      // Calculate technical analysis data (legacy lines 348-354)
      let taData = null;
      if (newPriceHistory.length >= TA_CONFIG.MA_PERIOD) {
        taData = TechnicalAnalysisService.calculateCompleteTA(newPriceHistory, newPrice);
      }

      // Create processed coin data (legacy line 355)
      const coinData: CryptoData = {
        symbol,
        price: newPrice,
        priceChangePercent: parseFloat(ticker.P),
        volume: parseFloat(ticker.q),
        signal: detectionResult.signal,
        priceHistory: newPriceHistory.slice(-TA_CONFIG.SPARKLINE_DATA_LENGTH), // For charts
        ta: taData,
        lastUpdated: new Date()
      };

      processedCoins.set(symbol, coinData);
      this.currentMarketData.set(symbol, coinData);
    }

    // Emit processed data
    this.emit('dataUpdate', Array.from(processedCoins.values()));
  }

  /**
   * Update detection settings
   */
  public updateDetectionSettings(settings: DetectionSettings): void {
    if (DetectionEngine.validateDetectionSettings(settings)) {
      this.detectionSettings = { ...settings };
      this.emit('settingsUpdated', this.detectionSettings);
    } else {
      throw new Error('Invalid detection settings provided');
    }
  }

  /**
   * Get current detection settings
   */
  public getDetectionSettings(): DetectionSettings {
    return { ...this.detectionSettings };
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Get historical data for a symbol
   */
  public getHistoricalData(symbol: string): HistoricalData | null {
    return this.dataHistory.get(symbol) || null;
  }

  /**
   * Clear historical data (useful for testing or reset)
   */
  public clearHistoricalData(): void {
    this.dataHistory.clear();
    this.currentMarketData.clear();
    this.emit('dataCleared');
  }

  /**
   * Get current market data for a specific symbol
   */
  public getCurrentCoinData(symbol: string): CryptoData | null {
    return this.currentMarketData.get(symbol.toUpperCase()) || null;
  }

  /**
   * Get all current market data
   */
  public getAllCurrentData(): CryptoData[] {
    return Array.from(this.currentMarketData.values());
  }

  /**
   * Set connection status and emit event
   */
  private setConnectionStatus(status: ConnectionStatus): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      this.emit('statusChange', status);
    }
  }

  /**
   * Schedule reconnection attempt
   * Extracted from legacy line 313 (setTimeout logic)
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= BINANCE_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = BINANCE_CONFIG.RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    this.reconnectTimer = setTimeout(() => {
      this.emit('reconnecting', this.reconnectAttempts);
      this.connect();
    }, delay);
  }

  /**
   * Check if service is connected
   */
  public isConnected(): boolean {
    return this.connectionStatus === 'connected';
  }
}

// Export singleton instance
export const binanceService = new BinanceService();
