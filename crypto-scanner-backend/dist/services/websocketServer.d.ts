import { EventEmitter } from 'events';
export declare class WebSocketServerService extends EventEmitter {
    private wss;
    private clients;
    private heartbeatInterval;
    private latestMarketData;
    constructor();
    start(port: number): void;
    stop(): void;
    private handleNewConnection;
    private handleClientMessage;
    private handleSubscribe;
    private handleUnsubscribe;
    private handleSettingsUpdate;
    private sendToClient;
    private broadcast;
    private setupBinanceServiceListeners;
    private startHeartbeat;
    private generateClientId;
    getConnectedClientsCount(): number;
    getStats(): any;
}
export declare const wsServer: WebSocketServerService;
//# sourceMappingURL=websocketServer.d.ts.map