/**
 * WebSocket Server Service
 * Provides real-time communication with frontend clients
 * Broadcasts market data updates and signal detections
 */

import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { binanceService, type CryptoData } from './binanceService.js';
import { WS_CONFIG } from '@/config/constants.js';

/**
 * Client message types
 */
interface ClientMessage {
  type: 'subscribe' | 'unsubscribe' | 'settings_update' | 'ping';
  payload?: {
    symbols?: string[];
    settings?: any;
  };
}

/**
 * Server message types
 */
interface ServerMessage {
  type: 'market_update' | 'signal_detected' | 'connection_status' | 'settings_updated' | 'pong' | 'error';
  payload: {
    data?: any;
    timestamp: string;
    message?: string;
  };
}

/**
 * Connected client interface
 */
interface ConnectedClient {
  ws: WebSocket;
  id: string;
  subscribedSymbols: Set<string>;
  lastPing: number;
  authenticated: boolean;
}

/**
 * WebSocket Server Class
 */
export class WebSocketServerService extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ConnectedClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private latestMarketData: CryptoData[] = [];

  constructor() {
    super();
    this.setupBinanceServiceListeners();
  }

  /**
   * Start WebSocket server
   */
  public start(port: number): void {
    this.wss = new WebSocketServer({ 
      port,
      perMessageDeflate: false // Disable compression for better performance
    });

    this.wss.on('connection', (ws, req) => {
      this.handleNewConnection(ws, req);
    });

    this.startHeartbeat();
    
    console.log(`WebSocket server started on port ${port}`);
    this.emit('serverStarted', port);
  }

  /**
   * Stop WebSocket server
   */
  public stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.clients.forEach(client => {
      client.ws.close();
    });
    this.clients.clear();

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    console.log('WebSocket server stopped');
    this.emit('serverStopped');
  }

  /**
   * Handle new WebSocket connection
   */
  private handleNewConnection(ws: WebSocket, req: any): void {
    const clientId = this.generateClientId();
    const client: ConnectedClient = {
      ws,
      id: clientId,
      subscribedSymbols: new Set(),
      lastPing: Date.now(),
      authenticated: false // TODO: Implement authentication
    };

    this.clients.set(clientId, client);

    // Send connection confirmation
    this.sendToClient(client, {
      type: 'connection_status',
      payload: {
        data: { 
          status: 'connected', 
          clientId,
          serverTime: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }
    });

    // Send current market data if available
    if (this.latestMarketData.length > 0) {
      this.sendToClient(client, {
        type: 'market_update',
        payload: {
          data: this.latestMarketData,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Handle messages from client
    ws.on('message', (data) => {
      this.handleClientMessage(client, data);
    });

    // Handle client disconnect
    ws.on('close', () => {
      this.clients.delete(clientId);
      console.log(`Client ${clientId} disconnected`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.clients.delete(clientId);
    });

    console.log(`New client connected: ${clientId}`);
  }

  /**
   * Handle messages from clients
   */
  private handleClientMessage(client: ConnectedClient, data: any): void {
    try {
      const message: ClientMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(client, message.payload?.symbols || []);
          break;

        case 'unsubscribe':
          this.handleUnsubscribe(client, message.payload?.symbols || []);
          break;

        case 'settings_update':
          this.handleSettingsUpdate(client, message.payload?.settings);
          break;

        case 'ping':
          client.lastPing = Date.now();
          this.sendToClient(client, {
            type: 'pong',
            payload: {
              timestamp: new Date().toISOString()
            }
          });
          break;

        default:
          this.sendToClient(client, {
            type: 'error',
            payload: {
              message: `Unknown message type: ${message.type}`,
              timestamp: new Date().toISOString()
            }
          });
      }
    } catch (error) {
      this.sendToClient(client, {
        type: 'error',
        payload: {
          message: 'Invalid message format',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Handle symbol subscription
   */
  private handleSubscribe(client: ConnectedClient, symbols: string[]): void {
    symbols.forEach(symbol => {
      client.subscribedSymbols.add(symbol.toUpperCase());
    });

    console.log(`Client ${client.id} subscribed to: ${symbols.join(', ')}`);
  }

  /**
   * Handle symbol unsubscription
   */
  private handleUnsubscribe(client: ConnectedClient, symbols: string[]): void {
    symbols.forEach(symbol => {
      client.subscribedSymbols.delete(symbol.toUpperCase());
    });

    console.log(`Client ${client.id} unsubscribed from: ${symbols.join(', ')}`);
  }

  /**
   * Handle settings update from client
   */
  private handleSettingsUpdate(client: ConnectedClient, settings: any): void {
    try {
      binanceService.updateDetectionSettings(settings);
      
      // Broadcast settings update to all clients
      this.broadcast({
        type: 'settings_updated',
        payload: {
          data: settings,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      this.sendToClient(client, {
        type: 'error',
        payload: {
          message: `Failed to update settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Send message to specific client
   */
  private sendToClient(client: ConnectedClient, message: ServerMessage): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcast(message: ServerMessage): void {
    this.clients.forEach(client => {
      this.sendToClient(client, message);
    });
  }

  /**
   * Setup listeners for Binance service events
   */
  private setupBinanceServiceListeners(): void {
    binanceService.on('dataUpdate', (cryptoData: CryptoData[]) => {
      this.latestMarketData = cryptoData;
      
      // Broadcast to all clients
      this.broadcast({
        type: 'market_update',
        payload: {
          data: cryptoData,
          timestamp: new Date().toISOString()
        }
      });

      // Check for significant signals and broadcast them
      const significantSignals = cryptoData.filter(coin => 
        ['PUMP', 'STRONG_PUMP', 'DUMP'].includes(coin.signal)
      );

      if (significantSignals.length > 0) {
        this.broadcast({
          type: 'signal_detected',
          payload: {
            data: significantSignals,
            timestamp: new Date().toISOString()
          }
        });
      }
    });

    binanceService.on('statusChange', (status) => {
      this.broadcast({
        type: 'connection_status',
        payload: {
          data: { binanceStatus: status },
          timestamp: new Date().toISOString()
        }
      });
    });
  }

  /**
   * Start heartbeat to check client connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      
      this.clients.forEach((client, clientId) => {
        if (now - client.lastPing > WS_CONFIG.HEARTBEAT_INTERVAL * 2) {
          console.log(`Client ${clientId} timed out`);
          client.ws.close();
          this.clients.delete(clientId);
        }
      });
    }, WS_CONFIG.HEARTBEAT_INTERVAL);
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connected clients count
   */
  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Get server statistics
   */
  public getStats(): any {
    return {
      connectedClients: this.clients.size,
      isRunning: this.wss !== null,
      latestDataCount: this.latestMarketData.length
    };
  }
}

// Export singleton instance
export const wsServer = new WebSocketServerService();
