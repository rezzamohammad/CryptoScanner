import { binanceService } from '@/services/binanceService.js';
export class MarketController {
    static async getAllTickers(req, res) {
        try {
            if (!binanceService.isConnected()) {
                res.status(503).json({
                    success: false,
                    error: 'Market data service is not connected',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const { limit = '50', sortBy = 'signal', signal, minVolume, search } = req.query;
            let allData = binanceService.getAllCurrentData();
            if (signal) {
                allData = allData.filter(coin => coin.signal === signal.toString().toUpperCase());
            }
            if (minVolume) {
                const minVol = parseFloat(minVolume.toString());
                allData = allData.filter(coin => coin.volume >= minVol);
            }
            if (search) {
                const searchTerm = search.toString().toLowerCase();
                allData = allData.filter(coin => coin.symbol.toLowerCase().includes(searchTerm));
            }
            if (sortBy === 'signal') {
                allData.sort((a, b) => {
                    const signalPriority = { 'STRONG_PUMP': 5, 'PUMP': 4, 'DUMP': 3, 'NEUTRAL': 2, 'GATHERING_DATA': 1 };
                    return (signalPriority[b.signal] || 0) -
                        (signalPriority[a.signal] || 0);
                });
            }
            else if (sortBy === 'volume') {
                allData.sort((a, b) => b.volume - a.volume);
            }
            else if (sortBy === 'change') {
                allData.sort((a, b) => b.priceChangePercent - a.priceChangePercent);
            }
            const limitNum = parseInt(limit.toString(), 10);
            const limitedData = allData.slice(0, limitNum);
            const response = {
                success: true,
                data: limitedData,
                timestamp: new Date().toISOString(),
                count: limitedData.length
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error in getAllTickers:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }
    static async getTicker(req, res) {
        try {
            const { symbol } = req.params;
            if (!symbol) {
                res.status(400).json({
                    success: false,
                    error: 'Symbol parameter is required',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const normalizedSymbol = symbol.toUpperCase();
            if (!normalizedSymbol.endsWith('USDT')) {
                res.status(400).json({
                    success: false,
                    error: 'Symbol must be a USDT trading pair',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (!binanceService.isConnected()) {
                res.status(503).json({
                    success: false,
                    error: 'Market data service is not connected',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const historicalData = binanceService.getHistoricalData(normalizedSymbol);
            if (!historicalData) {
                res.status(404).json({
                    success: false,
                    error: `No data found for symbol ${normalizedSymbol}`,
                    timestamp: new Date().toISOString()
                });
                return;
            }
            res.json({
                success: true,
                data: {
                    symbol: normalizedSymbol,
                    historicalData,
                    lastUpdated: new Date().toISOString()
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Error in getTicker:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }
    static async getMarketStats(req, res) {
        try {
            const connectionStatus = binanceService.getConnectionStatus();
            const detectionSettings = binanceService.getDetectionSettings();
            res.json({
                success: true,
                data: {
                    connectionStatus,
                    detectionSettings,
                    signalCounts: {
                        STRONG_PUMP: 0,
                        PUMP: 0,
                        DUMP: 0,
                        NEUTRAL: 0,
                        GATHERING_DATA: 0
                    },
                    totalSymbols: 0,
                    lastUpdate: new Date().toISOString()
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Error in getMarketStats:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }
    static async updateSettings(req, res) {
        try {
            const { eps_price, eps_volume, model } = req.body;
            if (typeof eps_price !== 'number' || typeof eps_volume !== 'number' || typeof model !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'Invalid settings format. Required: eps_price (number), eps_volume (number), model (string)',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (eps_price <= 1.0 || eps_price > 2.0) {
                res.status(400).json({
                    success: false,
                    error: 'eps_price must be between 1.0 and 2.0',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (eps_volume <= 1.0 || eps_volume > 20.0) {
                res.status(400).json({
                    success: false,
                    error: 'eps_volume must be between 1.0 and 20.0',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (!['Logarithmic', 'Exponential', 'Parabolic'].includes(model)) {
                res.status(400).json({
                    success: false,
                    error: 'model must be one of: Logarithmic, Exponential, Parabolic',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            binanceService.updateDetectionSettings({ eps_price, eps_volume, model: model });
            res.json({
                success: true,
                data: {
                    message: 'Detection settings updated successfully',
                    settings: { eps_price, eps_volume, model }
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Error in updateSettings:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }
    static async getSettings(req, res) {
        try {
            const settings = binanceService.getDetectionSettings();
            res.json({
                success: true,
                data: settings,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Error in getSettings:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }
    static async healthCheck(req, res) {
        try {
            const isConnected = binanceService.isConnected();
            const status = isConnected ? 'healthy' : 'unhealthy';
            res.status(isConnected ? 200 : 503).json({
                success: isConnected,
                data: {
                    status,
                    connectionStatus: binanceService.getConnectionStatus(),
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    memory: process.memoryUsage()
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Error in healthCheck:', error);
            res.status(500).json({
                success: false,
                error: 'Health check failed',
                timestamp: new Date().toISOString()
            });
        }
    }
}
//# sourceMappingURL=marketController.js.map