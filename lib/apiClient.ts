/**
 * API Client for CryptoScanner Backend
 * Handles all communication with the backend server
 */

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002';

/**
 * Market Data Types
 */
export interface CryptoData {
  symbol: string;
  price: number;
  priceChangePercent: number;
  volume: number;
  signal: string;
  priceHistory: number[];
  ta: {
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
  } | null;
  lastUpdated: string;
}

export interface MarketDataResponse {
  success: boolean;
  data: CryptoData[];
  timestamp: string;
  count: number;
}

export interface DetectionSettings {
  eps_price: number;
  eps_volume: number;
  model: 'Logarithmic' | 'Exponential' | 'Parabolic';
}

/**
 * API Client Class
 */
export class ApiClient {
  private static baseUrl = API_BASE_URL;

  /**
   * Generic fetch wrapper with error handling
   */
  private static async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get all cryptocurrency tickers
   */
  static async getTickers(params: {
    limit?: number;
    sortBy?: string;
    signal?: string;
    minVolume?: number;
    search?: string;
  } = {}): Promise<MarketDataResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/market/tickers${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.fetchApi<MarketDataResponse>(endpoint);
  }

  /**
   * Get specific ticker data
   */
  static async getTicker(symbol: string): Promise<any> {
    return this.fetchApi(`/api/market/ticker/${symbol}`);
  }

  /**
   * Get market statistics
   */
  static async getMarketStats(): Promise<any> {
    return this.fetchApi('/api/market/stats');
  }

  /**
   * Get current detection settings
   */
  static async getSettings(): Promise<{ success: boolean; data: DetectionSettings }> {
    return this.fetchApi('/api/market/settings');
  }

  /**
   * Update detection settings
   */
  static async updateSettings(settings: DetectionSettings): Promise<any> {
    return this.fetchApi('/api/market/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  /**
   * Get AI service status
   */
  static async getAIStatus(): Promise<any> {
    return this.fetchApi('/api/ai/status');
  }

  /**
   * Request AI analysis for a symbol
   */
  static async analyzeSymbol(symbol: string): Promise<any> {
    return this.fetchApi(`/api/ai/analyze/${symbol}`, {
      method: 'POST',
    });
  }

  /**
   * Test AI service
   */
  static async testAI(): Promise<any> {
    return this.fetchApi('/api/ai/test', {
      method: 'POST',
    });
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<any> {
    return fetch(`${this.baseUrl.replace('/api', '')}/health`).then(res => res.json());
  }
}

/**
 * WebSocket Client for Real-time Updates
 * Enhanced with proper memory management and listener tracking
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000; // Cap at 30 seconds

  // Enhanced listener management to prevent memory leaks
  private listenerRegistry: Map<string, Set<Function>> = new Map();
  private handlerMap: WeakMap<Function, string> = new WeakMap();
  private isConnected = false;

  // Heartbeat mechanism
  private pingInterval: NodeJS.Timeout | null = null;
  private readonly PING_INTERVAL = 25000; // Send ping every 25 seconds (before 30s server timeout)

  constructor() {
    this.connect();
  }

  /**
   * Connect to WebSocket server
   */
  private connect(): void {
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        this.reconnectAttempts = 0;
        this.isConnected = true;
        this.startPing();
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Handle pong responses (don't emit to prevent noise)
          if (message.type === 'pong') {
            // Pong received, connection is alive
            return;
          }

          this.emit(message.type, message.payload);
        } catch (error) {
          console.error('❌ WebSocket: Failed to parse message:', error);
          this.emit('parse_error', { error, rawData: event.data });
        }
      };

      this.ws.onclose = (event) => {
        console.log(`⚠️ WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`);
        this.isConnected = false;
        this.stopPing();
        this.emit('disconnected', { code: event.code, reason: event.reason });

        // Only attempt reconnection if it wasn't a clean close
        if (event.code !== 1000) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnected = false;
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection attempt with capped exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ WebSocket: Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached');
      return;
    }

    this.reconnectAttempts++;
    // Exponential backoff with maximum delay cap
    const exponentialDelay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    const delay = Math.min(exponentialDelay, this.maxReconnectDelay);

    console.log(`🔄 WebSocket: Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      console.log(`🔄 WebSocket: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  /**
   * Send message to server
   */
  send(type: string, payload?: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  /**
   * Subscribe to symbols
   */
  subscribe(symbols: string[]): void {
    this.send('subscribe', { symbols });
  }

  /**
   * Unsubscribe from symbols
   */
  unsubscribe(symbols: string[]): void {
    this.send('unsubscribe', { symbols });
  }

  /**
   * Update settings
   */
  updateSettings(settings: DetectionSettings): void {
    this.send('settings_update', { settings });
  }

  /**
   * Add event listener with enhanced tracking
   */
  on(event: string, callback: Function): void {
    // Initialize event set if it doesn't exist
    if (!this.listenerRegistry.has(event)) {
      this.listenerRegistry.set(event, new Set());
    }

    // Add callback to the set (automatically handles duplicates)
    this.listenerRegistry.get(event)!.add(callback);

    // Track the event type for this callback
    this.handlerMap.set(callback, event);

    console.log(`📡 WebSocket: Added listener for '${event}' (total: ${this.listenerRegistry.get(event)!.size})`);
  }

  /**
   * Remove event listener with enhanced cleanup
   */
  off(event: string, callback?: Function): void {
    if (callback) {
      // Remove specific callback
      const eventListeners = this.listenerRegistry.get(event);
      if (eventListeners && eventListeners.has(callback)) {
        eventListeners.delete(callback);
        this.handlerMap.delete(callback);
        console.log(`📡 WebSocket: Removed listener for '${event}' (remaining: ${eventListeners.size})`);

        // Clean up empty event sets
        if (eventListeners.size === 0) {
          this.listenerRegistry.delete(event);
        }
      }
    } else {
      // Remove all listeners for this event
      const eventListeners = this.listenerRegistry.get(event);
      if (eventListeners) {
        eventListeners.forEach(cb => this.handlerMap.delete(cb));
        this.listenerRegistry.delete(event);
        console.log(`📡 WebSocket: Removed all listeners for '${event}'`);
      }
    }
  }

  /**
   * Emit event to listeners with error handling
   */
  private emit(event: string, data?: any): void {
    const eventListeners = this.listenerRegistry.get(event);
    if (eventListeners && eventListeners.size > 0) {
      eventListeners.forEach((callback: Function) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ WebSocket: Error in listener for '${event}':`, error);
          // Remove problematic listener to prevent future errors
          this.off(event, callback);
        }
      });
    }
  }

  /**
   * Disconnect WebSocket with cleanup
   */
  disconnect(): void {
    console.log('🔌 WebSocket: Disconnecting...');

    this.stopPing();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Remove all listeners for cleanup
   */
  removeAllListeners(): void {
    console.log('🧹 WebSocket: Removing all listeners');

    // Clear all listeners
    this.listenerRegistry.forEach((listeners) => {
      listeners.forEach(callback => this.handlerMap.delete(callback));
    });

    this.listenerRegistry.clear();
    console.log('✅ WebSocket: All listeners removed');
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { isConnected: boolean; readyState: number | null; listenerCount: number } {
    const listenerCount = Array.from(this.listenerRegistry.values())
      .reduce((total, set) => total + set.size, 0);

    return {
      isConnected: this.isConnected,
      readyState: this.ws?.readyState || null,
      listenerCount
    };
  }

  /**
   * Force reconnection (useful for testing or manual recovery)
   */
  forceReconnect(): void {
    console.log('🔄 WebSocket: Force reconnecting...');
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  /**
   * Start sending ping messages to keep connection alive
   */
  private startPing(): void {
    this.stopPing(); // Clear any existing interval
    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('ping');
      }
    }, this.PING_INTERVAL);
  }

  /**
   * Stop sending ping messages
   */
  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient();
