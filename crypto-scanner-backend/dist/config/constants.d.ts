export declare const SERVER_CONFIG: {
    readonly NODE_ENV: string;
    readonly PORT: number;
    readonly HOST: string;
};
export declare const BINANCE_CONFIG: {
    readonly WS_URL: string;
    readonly RECONNECT_DELAY: 5000;
    readonly MAX_RECONNECT_ATTEMPTS: 10;
};
export declare const TA_CONFIG: {
    readonly DATA_HISTORY_LENGTH: number;
    readonly SPARKLINE_DATA_LENGTH: number;
    readonly MA_PERIOD: number;
    readonly RSI_PERIOD: number;
    readonly BBANDS_PERIOD: number;
    readonly BBANDS_STD_DEV: 2;
};
export declare const DETECTION_CONFIG: {
    readonly DEFAULT_PRICE_SENSITIVITY: number;
    readonly DEFAULT_VOLUME_SENSITIVITY: number;
    readonly DEFAULT_MODEL: string;
    readonly MODEL_MULTIPLIERS: {
        readonly Parabolic: 0.8;
        readonly Exponential: 1;
        readonly Logarithmic: 1.2;
    };
    readonly STRONG_PUMP_THRESHOLD: 0.005;
    readonly DUMP_THRESHOLD: -2;
};
export declare const SIGNAL_TYPES: {
    readonly GATHERING_DATA: "GATHERING_DATA";
    readonly NEUTRAL: "NEUTRAL";
    readonly PUMP: "PUMP";
    readonly STRONG_PUMP: "STRONG_PUMP";
    readonly DUMP: "DUMP";
};
export declare const SIGNAL_PRIORITY: {
    readonly STRONG_PUMP: 5;
    readonly PUMP: 4;
    readonly DUMP: 3;
    readonly NEUTRAL: 2;
    readonly GATHERING_DATA: 1;
};
export declare const GEMINI_CONFIG: {
    readonly API_KEY: string;
    readonly API_URL: string;
    readonly TIMEOUT: 30000;
    readonly MAX_RETRIES: 3;
};
export declare const SECURITY_CONFIG: {
    readonly JWT_SECRET: string;
    readonly API_KEY: string;
    readonly RATE_LIMIT: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: number;
    };
};
export declare const WS_CONFIG: {
    readonly HEARTBEAT_INTERVAL: number;
    readonly MAX_CONNECTIONS: number;
};
export declare const CORS_CONFIG: {
    readonly ALLOWED_ORIGINS: string[];
};
export declare const LOG_CONFIG: {
    readonly LEVEL: string;
    readonly FILE: string;
};
export type DetectionModel = keyof typeof DETECTION_CONFIG.MODEL_MULTIPLIERS;
export type SignalType = keyof typeof SIGNAL_TYPES;
export interface DetectionSettings {
    eps_price: number;
    eps_volume: number;
    model: DetectionModel;
}
export declare const DEFAULT_DETECTION_SETTINGS: DetectionSettings;
//# sourceMappingURL=constants.d.ts.map