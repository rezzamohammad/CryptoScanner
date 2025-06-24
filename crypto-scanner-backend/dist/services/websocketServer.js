import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { binanceService } from './binanceService.js';
import { WS_CONFIG } from '@/config/constants.js';
export class WebSocketServerService extends EventEmitter {
    wss = null;
    clients = new Map();
    heartbeatInterval = null;
    latestMarketData = [];
    constructor() {
        super();
        this.setupBinanceServiceListeners();
    }
    start(port) {
        this.wss = new WebSocketServer({
            port,
            perMessageDeflate: false
        });
        this.wss.on('connection', (ws, req) => {
            this.handleNewConnection(ws, req);
        });
        this.startHeartbeat();
        console.log(`WebSocket server started on port ${port}`);
        this.emit('serverStarted', port);
    }
    stop() {
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
    handleNewConnection(ws, req) {
        const clientId = this.generateClientId();
        const client = {
            ws,
            id: clientId,
            subscribedSymbols: new Set(),
            lastPing: Date.now(),
            authenticated: false
        };
        this.clients.set(clientId, client);
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
        if (this.latestMarketData.length > 0) {
            this.sendToClient(client, {
                type: 'market_update',
                payload: {
                    data: this.latestMarketData,
                    timestamp: new Date().toISOString()
                }
            });
        }
        ws.on('message', (data) => {
            this.handleClientMessage(client, data);
        });
        ws.on('close', () => {
            this.clients.delete(clientId);
            console.log(`Client ${clientId} disconnected`);
        });
        ws.on('error', (error) => {
            console.error(`WebSocket error for client ${clientId}:`, error);
            this.clients.delete(clientId);
        });
        console.log(`New client connected: ${clientId}`);
    }
    handleClientMessage(client, data) {
        try {
            const message = JSON.parse(data.toString());
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
        }
        catch (error) {
            this.sendToClient(client, {
                type: 'error',
                payload: {
                    message: 'Invalid message format',
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
    handleSubscribe(client, symbols) {
        symbols.forEach(symbol => {
            client.subscribedSymbols.add(symbol.toUpperCase());
        });
        console.log(`Client ${client.id} subscribed to: ${symbols.join(', ')}`);
    }
    handleUnsubscribe(client, symbols) {
        symbols.forEach(symbol => {
            client.subscribedSymbols.delete(symbol.toUpperCase());
        });
        console.log(`Client ${client.id} unsubscribed from: ${symbols.join(', ')}`);
    }
    handleSettingsUpdate(client, settings) {
        try {
            binanceService.updateDetectionSettings(settings);
            this.broadcast({
                type: 'settings_updated',
                payload: {
                    data: settings,
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            this.sendToClient(client, {
                type: 'error',
                payload: {
                    message: `Failed to update settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
    sendToClient(client, message) {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
        }
    }
    broadcast(message) {
        this.clients.forEach(client => {
            this.sendToClient(client, message);
        });
    }
    setupBinanceServiceListeners() {
        binanceService.on('dataUpdate', (cryptoData) => {
            this.latestMarketData = cryptoData;
            this.broadcast({
                type: 'market_update',
                payload: {
                    data: cryptoData,
                    timestamp: new Date().toISOString()
                }
            });
            const significantSignals = cryptoData.filter(coin => ['PUMP', 'STRONG_PUMP', 'DUMP'].includes(coin.signal));
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
    startHeartbeat() {
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
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getConnectedClientsCount() {
        return this.clients.size;
    }
    getStats() {
        return {
            connectedClients: this.clients.size,
            isRunning: this.wss !== null,
            latestDataCount: this.latestMarketData.length
        };
    }
}
export const wsServer = new WebSocketServerService();
//# sourceMappingURL=websocketServer.js.map