import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from 'react';

// --- STYLES ---
const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    :root { --font-sans: 'Inter', sans-serif; }
    :root[data-theme='light'] { --bg-primary: #F7F8FC; --bg-secondary: #FFFFFF; --text-primary: #1A1A1A; --text-secondary: #6B7280; --border-color: #E5E7EB; --card-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.05); --accent-green: #16A34A; --accent-red: #D9463D; --accent-amber: #F59E0B; --accent-blue: #2563EB; }
    :root[data-theme='dark'] { --bg-primary: #0D1117; --bg-secondary: #161B22; --text-primary: #E6EDF3; --text-secondary: #8B949E; --border-color: #30363D; --card-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.2); --accent-green: #34D399; --accent-red: #FF453A; --accent-amber: #FF9F0A; --accent-blue: #0A84FF; }
    body { font-family: var(--font-sans); background-color: var(--bg-primary); color: var(--text-primary); transition: background-color 0.2s ease; min-height: 100vh; }
    .app-container { max-width: 1400px; margin: 0 auto; padding: 1rem; }
    .header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem; }
    .header h1 { font-size: 1.5rem; font-weight: 600; }
    .header .logo-accent { color: var(--accent-green); font-weight: 700; }
    .header-controls { display: flex; align-items: center; gap: 1.5rem; }
    .settings-panel { width: 100%; padding: 1.5rem; margin-top: 1rem; background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 0.75rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .settings-row { display: flex; flex-wrap: wrap; gap: 2.5rem; align-items: center; }
    .setting-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .setting-group label { font-size: 0.875rem; color: var(--text-secondary); font-weight: 500; }
    .setting-group input[type="range"] { -webkit-appearance: none; appearance: none; width: 180px; height: 8px; background: var(--border-color); border-radius: 5px; outline: none; transition: background 0.3s; }
    .setting-group input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; background: var(--accent-green); cursor: pointer; border-radius: 50%; }
    .setting-group .value-display { font-weight: 600; min-width: 60px; text-align: right; }
    .model-selector { display: flex; gap: 0.5rem; background-color: var(--bg-primary); padding: 0.25rem; border-radius: 0.5rem; border: 1px solid var(--border-color); }
    .model-selector button { flex-grow: 1; padding: 0.5rem 1rem; border: none; background-color: transparent; color: var(--text-secondary); font-weight: 600; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s ease; }
    .model-selector button.active { background-color: var(--accent-green); color: white; }
    .model-description { font-size: 0.8rem; color: var(--text-secondary); max-width: 600px; margin-top: 0.5rem; }
    .connection-status { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; }
    .status-connecting { background-color: var(--accent-amber); }
    .status-connected { background-color: var(--accent-green); animation: pulse 2s infinite; }
    .status-disconnected { background-color: var(--accent-red); }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(0,0,0,0); } 100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); } }
    .theme-switcher { cursor: pointer; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 9999px; padding: 4px; display: flex; }
    .theme-switcher span { font-size: 1.25rem; line-height: 1; padding: 4px; border-radius: 9999px; transition: all 0.3s ease; }
    .theme-switcher .active { background-color: var(--accent-green); color: white !important; }
    .crypto-list-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
    .crypto-card { background: var(--bg-secondary); border-radius: 1rem; border: 1px solid var(--border-color); padding: 1.5rem; box-shadow: var(--card-shadow); transition: background-color 0.3s, border-color 0.3s, transform 0.2s; display: flex; flex-direction: column; }
    .crypto-card:hover { transform: translateY(-4px); }
    .card-content { flex-grow: 1; }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .symbol-group .symbol { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
    .symbol-group .price-change { font-size: 1rem; font-weight: 500; }
    .text-positive { color: var(--accent-green); }
    .text-negative { color: var(--accent-red); }
    .card-body { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-end; }
    .card-info .price { font-size: 2rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); }
    .info-row { font-size: 0.875rem; color: var(--text-secondary); }
    .info-row .info-value { font-weight: 500; color: var(--text-primary); margin-left: 0.5rem; }
    .sparkline-container { width: 150px; height: 60px; }
    .card-footer { margin-top: 1.5rem; }
    .ai-button { width: 100%; background-color: var(--accent-green); color: white; border: none; border-radius: 0.5rem; padding: 0.75rem 1rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; }
    .ai-button:hover { filter: brightness(1.1); }
    .ai-button:disabled { background-color: var(--text-secondary); cursor: not-allowed; }
    .footer { text-align: center; padding: 2rem 0; margin-top: 2rem; border-top: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.875rem; }
    .initial-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 50vh; gap: 1rem; font-size: 1.2rem; color: var(--text-secondary); }
    .spinner { width: 32px; height: 32px; border: 4px solid var(--border-color); border-top-color: var(--accent-green); border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 2rem; border-radius: 1rem; max-width: 600px; width: 90%; box-shadow: 0 8px 32px 0 rgba(0,0,0,0.3); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .modal-header h2 { font-size: 1.25rem; font-weight: 600; }
    .modal-close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary); }
    .modal-body { line-height: 1.6; max-height: 70vh; overflow-y: auto; }
    .gemini-preloader { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin: 1rem 0; }
    .report-section { margin-bottom: 1.5rem; }
    .report-section h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
    .ta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 1rem; }
    .ta-item { display: flex; justify-content: space-between; font-size: 0.875rem; padding: 0.25rem 0; }
    .ta-label { color: var(--text-secondary); }
    .ta-value { font-weight: 600; color: var(--text-primary); }
    .risk-warning { background-color: var(--accent-amber); color: black; padding: 1rem; border-radius: 0.5rem; font-weight: 500; }
`;


// --- CONTEXTS ---
const ThemeContext = createContext(null);
const useTheme = () => useContext(ThemeContext);
const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        setTheme(savedTheme);
    }, []);
    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            return newTheme;
        });
    }, []);
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};


// --- SERVICES ---
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!ticker@arr';
const DATA_HISTORY_LENGTH = 200;
const SPARKLINE_DATA_LENGTH = 30;
const MA_PERIOD = 60;
const RSI_PERIOD = 14;
const BBANDS_PERIOD = 20;

const TAService = {
    sma: (data, period) => {
        if (!data || data.length < period) return null;
        const slice = data.slice(-period);
        return slice.reduce((acc, val) => acc + val, 0) / period;
    },
    rsi: (data, period = 14) => {
        if (!data || data.length < period + 1) return null;
        let gains = 0, losses = 0;
        for (let i = data.length - period; i < data.length; i++) {
            const diff = data[i] - data[i - 1];
            if (diff > 0) gains += diff; else losses -= diff;
        }
        if (gains === 0) return 0;
        if (losses === 0) return 100;
        const rs = (gains / period) / (losses / period);
        return 100 - (100 / (1 + rs));
    },
    bollingerBands: (data, period, stdDev) => {
        if (!data || data.length < period) return null;
        const middle = TAService.sma(data, period);
        if (middle === null) return null;
        const slice = data.slice(-period);
        const std = Math.sqrt(slice.map(n => Math.pow(n - middle, 2)).reduce((a, b) => a + b) / period);
        return { upper: middle + (std * stdDev), middle, lower: middle - (std * stdDev) };
    },
    findRecentHigh: (data) => Math.max(...data),
    findRecentLow: (data) => Math.min(...data),
};

const detectPumpAndDump = (data, settings) => {
    const { priceHistory, volumePerSecondHistory, currentPrice, currentVolumePerSecond } = data;
    const { eps_price, eps_volume, model } = settings;
    if (priceHistory.length < MA_PERIOD || volumePerSecondHistory.length < MA_PERIOD) return 'GATHERING_DATA';
    
    const priceMA = TAService.sma(priceHistory, MA_PERIOD);
    const volumePerSecondMA = TAService.sma(volumePerSecondHistory, MA_PERIOD);
    
    if (priceMA === null || volumePerSecondMA === null || volumePerSecondMA === 0) return 'GATHERING_DATA';
    
    let effective_eps_price = eps_price;
    if (model === 'Parabolic') effective_eps_price = 1 + ((eps_price - 1) * 0.8);
    if (model === 'Logarithmic') effective_eps_price = 1 + ((eps_price - 1) * 1.2);

    const isPriceAnomaly = currentPrice > (priceMA * effective_eps_price);
    const isVolumeAnomaly = currentVolumePerSecond > (volumePerSecondMA * eps_volume);
    
    if (isPriceAnomaly && isVolumeAnomaly) {
        if (currentPrice > (priceMA * (effective_eps_price + 0.005))) return 'STRONG_PUMP';
        return 'PUMP';
    }
    
    if (priceHistory.length < 2) return 'NEUTRAL';
    const priceChange = ((currentPrice - priceHistory[priceHistory.length - 2]) / priceHistory[priceHistory.length - 2]) * 100;
    if (priceChange < -2.0) return 'DUMP';
    
    return 'NEUTRAL';
};

async function getAdvancedGeminiAnalysis(coin, settings) {
    const { symbol, price, signal, ta } = coin;
    const jsonSchema = { type: "OBJECT", properties: { "Reason": { "type": "STRING" }, "PriceAction": { "type": "OBJECT", "properties": { "CurrentPrice": { "type": "STRING" }, "RecentHigh": { "type": "STRING" }, "RecentLow": { "type": "STRING" }, "PriceSpikeAnalysis": { "type": "STRING" } } }, "VolumeAnalysis": { "type": "OBJECT", "properties": { "CurrentVolume": { "type": "STRING" }, "MovingAverageVolume": { "type": "STRING" }, "VolumeSpikeMagnitude": { "type": "STRING" }, "OBV_Confirmation": { "type": "STRING" } } }, "SMA": { "type": "OBJECT", "properties": { "ShortTermSMA": { "type": "STRING" }, "PriceVsSMA": { "type": "STRING" } } }, "TechnicalIndicators": { "type": "OBJECT", "properties": { "RSI": { "type": "OBJECT", "properties": { "CurrentRSI": { "type": "STRING" }, "OverboughtDivergence": { "type": "STRING" } } }, "MACD": { "type": "OBJECT", "properties": { "MACDLine": { "type": "STRING" }, "SignalLine": { "type": "STRING" }, "MACDCrossover": { "type": "STRING" } } }, "BollingerBands": { "type": "OBJECT", "properties": { "BandExpansion": { "type": "STRING" }, "PricePosition": { "type": "STRING" } } } } }, "SuggestedStrategy": { "type": "STRING" }, "RiskWarning": { "type": "STRING" } } };
    const prompt = `Act as a crypto market analyst observing ${symbol.replace('USDT','')}. The system is using the "${settings.model}" detection model. The system flagged a "${signal.replace('_', ' ')}" signal. Populate the JSON object based on the provided data. Do not add any commentary outside the JSON structure.
Data:
- Current Price: ${price} USD
- 24h Price Change: ${coin.priceChangePercent}%
- 24h Volume: ${coin.volume} USDT
- Short-Term SMA (${MA_PERIOD}-tick): ${ta.sma}
- Price vs SMA: ${ta.priceVsSma}
- Recent High (${DATA_HISTORY_LENGTH}-tick): ${ta.high}
- Recent Low (${DATA_HISTORY_LENGTH}-tick): ${ta.low}
- RSI (${RSI_PERIOD}-tick): ${ta.rsi}
- Bollinger Bands: Upper=${ta.bollingerBands.upper}, Middle=${ta.bollingerBands.middle}, Lower=${ta.bollingerBands.lower}
- Volume Spike vs MA: ${settings.eps_volume}x
- OBV (not implemented): Assess based on volume spike confirmation.
- MACD (not implemented): Assess based on Price vs SMA.
- Liquidity/MarketCap/WhaleActivity/Social: Not implemented. Mark as "N/A" or "Requires external data".`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: jsonSchema }
    };
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`Gemini API error! status: ${response.status}`);
        const result = await response.json();
        const jsonString = result.candidates[0].content.parts[0].text.replace(/```json\n|```/g, '');
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error calling or parsing Gemini API:", error);
        return { Reason: "Failed to generate AI analysis. The model may have returned an invalid format.", RiskWarning: "AI analysis could not be completed." };
    }
}


// --- COMPONENTS ---
const Header = ({ connectionStatus }) => {
    const { theme, toggleTheme } = useTheme();
    return ( <header className="header"> <h1>Crypto<span className="logo-accent">Scanner</span></h1> <div className="header-controls"> <div className="connection-status"><div className={`status-dot status-${connectionStatus}`}></div><span>{connectionStatus}</span></div> <div className="theme-switcher" onClick={toggleTheme}><span className={theme === 'light' ? 'active' : ''}>☀️</span><span className={theme === 'dark' ? 'active' : ''}>🌙</span></div> </div> </header> );
};
const Footer = () => ( <footer className="footer"><p>CryptoScanner v13.1 Final & Stable | Data from Binance</p></footer> );

const Sparkline = React.memo(({ data, color }) => {
    if (!data || data.length < 2) return <div className="sparkline-container" />;
    const width = 150, height = 60;
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min === 0 ? 1 : max - min;
    const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - ((d - min) / range) * height}`).join(' ');
    return (<svg className="sparkline-container" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none"><polyline fill="none" stroke={color} strokeWidth="2" points={points} /></svg>);
});

const CryptoCard = React.memo(({ coin, onAnalyzeClick }) => {
    const { symbol, price, priceChangePercent, volume, signal, priceHistory, ta } = coin;
    const priceChangeColor = priceChangePercent >= 0 ? 'text-positive' : 'text-negative';
    const sparklineColor = priceChangePercent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: value < 1 ? 6 : 2 }).format(value);
    const formatLargeNumber = (value) => { const num = Number(value); if (num > 1e9) return `${(num / 1e9).toFixed(2)}B`; if (num > 1e6) return `${(num / 1e6).toFixed(2)}M`; if (num > 1e3) return `${(num / 1e3).toFixed(2)}K`; return num.toLocaleString(); };
    return (
        <div className="crypto-card">
            <div className="card-content">
                <div className="card-header"><div className="symbol-group"><span className="symbol">{symbol.replace('USDT', '')}</span></div><span className={`price-change ${priceChangeColor}`}>{Number(priceChangePercent).toFixed(2)}%</span></div>
                <div className="card-body">
                    <div className="card-info">
                        <span className="price">{formatCurrency(price)}</span>
                        <div className="info-row"><span className="info-label">24h Volume</span><span className="info-value">{formatLargeNumber(volume)}</span></div>
                        <div className="info-row"><span className="info-label">Signal</span><span className="info-value">{signal.replace(/_/g, ' ')}</span></div>
                    </div>
                    <Sparkline data={priceHistory} color={sparklineColor} />
                </div>
            </div>
            <div className="card-footer">
                {(signal === 'STRONG_PUMP' || signal === 'PUMP' || signal === 'DUMP') && (
                    <button className="ai-button" onClick={() => onAnalyzeClick(coin)} disabled={!ta}>
                        {ta ? '✨ AI Strategy Report' : 'Gathering Data...'}
                    </button>
                )}
            </div>
        </div>
    );
});

const GeminiAnalysisModal = ({ coin, onClose, isVisible, settings }) => {
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (isVisible && coin && coin.ta) {
            setIsLoading(true); setAnalysis(null);
            getAdvancedGeminiAnalysis(coin, settings).then(data => { setAnalysis(data); setIsLoading(false); });
        }
    }, [coin, isVisible, settings]);
    if (!isVisible) return null;
    return (
        <div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>✨ AI Strategy Report: {coin.symbol.replace('USDT','')}</h2><button onClick={onClose} className="modal-close-btn">&times;</button></div>
            <div className="modal-body">{isLoading ? (<div className="gemini-preloader"><div className="spinner"></div><p>Gemini is analyzing market data...</p></div>) : analysis?.Reason ? (
                <div>
                    <div className="report-section"><h3>Reason</h3><p>{analysis.Reason}</p></div>
                    <div className="report-section"><h3>Price Action</h3><div className="ta-grid">
                        <div className="ta-item"><span className="ta-label">Current Price</span><span className="ta-value">{analysis.PriceAction.CurrentPrice}</span></div>
                        <div className="ta-item"><span className="ta-label">Recent High</span><span className="ta-value">{analysis.PriceAction.RecentHigh}</span></div>
                        <div className="ta-item"><span className="ta-label">Recent Low</span><span className="ta-value">{analysis.PriceAction.RecentLow}</span></div>
                    </div><p style={{marginTop: '0.5rem'}}>{analysis.PriceAction.PriceSpikeAnalysis}</p></div>
                    <div className="report-section"><h3>Technical Indicators</h3><div className="ta-grid">
                        <div className="ta-item"><span className="ta-label">RSI</span><span className="ta-value">{analysis.TechnicalIndicators.RSI.CurrentRSI}</span></div>
                        <div className="ta-item"><span className="ta-label">BBands Position</span><span className="ta-value">{analysis.TechnicalIndicators.BollingerBands.PricePosition}</span></div>
                    </div></div>
                    <div className="report-section"><h3>Strategy & Risk</h3><p>{analysis.SuggestedStrategy}</p><p className="risk-warning" style={{marginTop: '1rem'}}>{analysis.RiskWarning}</p></div>
                </div>
            ) : <p>Could not load analysis.</p>}</div>
        </div></div>
    );
};


// --- App Structure: Rebuilt for Stability ---
const Dashboard = () => {
    const [coins, setCoins] = useState({});
    const [analyzingCoin, setAnalyzingCoin] = useState(null);
    const [settings, setSettings] = useState({ eps_price: 1.001, eps_volume: 2.0, model: 'Exponential' });
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const ws = useRef(null);
    const dataHistory = useRef({});
    const settingsRef = useRef(settings);

    useEffect(() => { settingsRef.current = settings; }, [settings]);

    const handleSettingChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: parseFloat(value) }));
    };
    const handleModelChange = (model) => {
        setSettings(prev => ({ ...prev, model }));
    };
    
    const modelDescriptions = {
        Logarithmic: "Highest sensitivity. Best for catching fast, sharp initial spikes.",
        Exponential: "Balanced (Default). Best for typical, steady-growth pumps.",
        Parabolic: "Lowest sensitivity. Tuned for pumps that start slow and accelerate late."
    };

    const connectWebSocket = useCallback(() => {
        ws.current = new WebSocket(BINANCE_WS_URL);
        ws.current.onopen = () => setConnectionStatus('connected');
        ws.current.onclose = () => { setConnectionStatus('disconnected'); setTimeout(connectWebSocket, 5000); };
        ws.current.onerror = () => ws.current.close();
        ws.current.onmessage = (event) => {
            const tickers = JSON.parse(event.data);
            setCoins(prevCoins => {
                const updatedCoins = { ...prevCoins };
                for (const ticker of tickers) {
                    if (!ticker.s.endsWith('USDT')) continue;
                    const symbol = ticker.s;
                    const newPrice = parseFloat(ticker.c);
                    const newTotalVolume = parseFloat(ticker.v);
                    const now = Date.now();
                    const history = dataHistory.current[symbol] || { priceHistory: [], volumePerSecondHistory: [], lastTotalVolume: newTotalVolume, lastTimestamp: now - 1000 };
                    
                    const timeDelta = Math.max(1, (now - history.lastTimestamp) / 1000);
                    const volumeDelta = Math.max(0, newTotalVolume - history.lastTotalVolume);
                    const volumePerSecond = volumeDelta / timeDelta;

                    const newPriceHistory = [...history.priceHistory, newPrice].slice(-DATA_HISTORY_LENGTH);
                    const newVolumePerSecondHistory = [...history.volumePerSecondHistory, volumePerSecond].slice(-DATA_HISTORY_LENGTH);
                    
                    dataHistory.current[symbol] = { 
                        priceHistory: newPriceHistory, 
                        volumePerSecondHistory: newVolumePerSecondHistory,
                        lastTotalVolume: newTotalVolume,
                        lastTimestamp: now
                    };
                    
                    const signal = detectPumpAndDump({ 
                        priceHistory: newPriceHistory, 
                        volumePerSecondHistory: newVolumePerSecondHistory, 
                        currentPrice: newPrice, 
                        currentVolumePerSecond: volumePerSecond 
                    }, settingsRef.current);
                    
                    let taData = null;
                    if (newPriceHistory.length >= MA_PERIOD) {
                        const sma = TAService.sma(newPriceHistory, MA_PERIOD);
                        const rsi = TAService.rsi(newPriceHistory, RSI_PERIOD);
                        const bbands = TAService.bollingerBands(newPriceHistory, BBANDS_PERIOD, 2);
                        if (sma && rsi && bbands) taData = { sma, rsi: rsi.toFixed(1), high: TAService.findRecentHigh(newPriceHistory), low: TAService.findRecentLow(newPriceHistory), priceVsSma: newPrice > sma ? 'Above' : 'Below', bollingerBands: { upper: bbands.upper.toFixed(4), middle: bbands.middle.toFixed(4), lower: bbands.lower.toFixed(4) } };
                    }
                    updatedCoins[symbol] = { symbol, price: newPrice, priceChangePercent: parseFloat(ticker.P), volume: parseFloat(ticker.q), signal, priceHistory: newPriceHistory.slice(-SPARKLINE_DATA_LENGTH), ta: taData };
                }
                return updatedCoins;
            });
        };
    }, []);

    useEffect(() => {
        connectWebSocket();
        return () => ws.current?.close();
    }, [connectWebSocket]);

    const sortedCoins = useMemo(() => {
        const signalOrder = { 'STRONG_PUMP': 5, 'PUMP': 4, 'DUMP': 3, 'NEUTRAL': 2, 'GATHERING_DATA': 1 };
        return Object.values(coins).sort((a, b) => {
            const signalDiff = (signalOrder[b.signal] || 0) - (signalOrder[a.signal] || 0);
            if (signalDiff !== 0) return signalDiff;
            return b.volume - a.volume;
        });
    }, [coins]);
    
    return (
        <div className="app-container">
            <Header connectionStatus={connectionStatus}/>
            <GeminiAnalysisModal isVisible={!!analyzingCoin} coin={analyzingCoin} settings={settings} onClose={() => setAnalyzingCoin(null)} />
            <div className="settings-panel">
                 <div className="settings-row">
                    <div className="setting-group">
                        <label>Detection Model</label>
                        <div className="model-selector">
                           <button onClick={() => handleModelChange('Logarithmic')} className={settings.model === 'Logarithmic' ? 'active' : ''}>Logarithmic</button>
                           <button onClick={() => handleModelChange('Exponential')} className={settings.model === 'Exponential' ? 'active' : ''}>Exponential</button>
                           <button onClick={() => handleModelChange('Parabolic')} className={settings.model === 'Parabolic' ? 'active' : ''}>Parabolic</button>
                        </div>
                    </div>
                </div>
                <div className="settings-row"><p className="model-description">{modelDescriptions[settings.model]}</p></div>
                 <div className="settings-row">
                    <div className="setting-group">
                        <label htmlFor="eps_price">Price Sensitivity</label>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                           <input type="range" id="eps_price" name="eps_price" min="1.001" max="1.5" step="0.001" value={settings.eps_price} onChange={handleSettingChange} />
                           <span className="value-display">+{((settings.eps_price - 1) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                     <div className="setting-group">
                        <label htmlFor="eps_volume">Volume Sensitivity</label>
                         <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                           <input type="range" id="eps_volume" name="eps_volume" min="1.5" max="10" step="0.5" value={settings.eps_volume} onChange={handleSettingChange} />
                           <span className="value-display">{settings.eps_volume.toFixed(1)}x</span>
                        </div>
                    </div>
                 </div>
            </div>
            <main>
                <div className="crypto-list-grid">
                    {sortedCoins.length > 0 ? sortedCoins.map(coin => (
                        <CryptoCard key={coin.symbol} coin={coin} onAnalyzeClick={setAnalyzingCoin} />
                    )) : (<div className="initial-loading"><div className="spinner"></div><p>Connecting to Binance and gathering market data...</p></div>)}
                </div>
            </main>
            <Footer />
        </div>
    );
};

const App = () => {
  return (
    <ThemeProvider>
        <style>{styles}</style>
        <Dashboard />
    </ThemeProvider>
  );
};

export default App;
