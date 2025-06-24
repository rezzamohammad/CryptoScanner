/**
 * Data Transformation Utilities
 * Maps backend API data to frontend component format
 */

import type { CryptoData as BackendCryptoData } from './apiClient';

/**
 * Frontend crypto data interface (matches current component expectations)
 */
export interface FrontendCryptoData {
  symbol: string;          // "BTC" (without USDT)
  name: string;           // "Bitcoin"
  price: number;          // 50000.00
  change: number;         // 2.5 (percentage)
  volume: string;         // "1.2B" (formatted)
  signal: string;         // "PUMP", "DUMP", "NEUTRAL"
  chartData: number[];    // Price history for charts
  detectionTime: Date;    // When signal was detected
  ta?: any;              // Technical analysis data (optional)
}

/**
 * Cryptocurrency name mapping
 * Maps trading pair symbols to full names
 */
const CRYPTO_NAME_MAP: Record<string, string> = {
  'BTCUSDT': 'Bitcoin',
  'ETHUSDT': 'Ethereum',
  'BNBUSDT': 'BNB',
  'XRPUSDT': 'XRP',
  'ADAUSDT': 'Cardano',
  'SOLUSDT': 'Solana',
  'DOGEUSDT': 'Dogecoin',
  'DOTUSDT': 'Polkadot',
  'MATICUSDT': 'Polygon',
  'SHIBUSDT': 'Shiba Inu',
  'AVAXUSDT': 'Avalanche',
  'LTCUSDT': 'Litecoin',
  'UNIUSDT': 'Uniswap',
  'LINKUSDT': 'Chainlink',
  'ATOMUSDT': 'Cosmos',
  'ETCUSDT': 'Ethereum Classic',
  'XLMUSDT': 'Stellar',
  'BCHUSDT': 'Bitcoin Cash',
  'FILUSDT': 'Filecoin',
  'TRXUSDT': 'TRON',
  'EOSUSDT': 'EOS',
  'AAVEUSDT': 'Aave',
  'GRTUSDT': 'The Graph',
  'MKRUSDT': 'Maker',
  'COMPUSDT': 'Compound',
  'YFIUSDT': 'yearn.finance',
  'SUSHIUSDT': 'SushiSwap',
  'SNXUSDT': 'Synthetix',
  'CRVUSDT': 'Curve DAO Token',
  'BALUSDT': 'Balancer',
  'RENUSDT': 'Ren',
  'KNCUSDT': 'Kyber Network',
  'ZRXUSDT': '0x',
  'BATUSDT': 'Basic Attention Token',
  'ENJUSDT': 'Enjin Coin',
  'MANAUSDT': 'Decentraland',
  'SANDUSDT': 'The Sandbox',
  'CHZUSDT': 'Chiliz',
  'FLOWUSDT': 'Flow',
  'ICPUSDT': 'Internet Computer',
  'THETAUSDT': 'Theta Network',
  'VETUSDT': 'VeChain',
  'FTMUSDT': 'Fantom',
  'ALGOUSDT': 'Algorand',
  'XTZUSDT': 'Tezos',
  'EGLDUSDT': 'MultiversX',
  'NEARUSDT': 'NEAR Protocol',
  'KLAYUSDT': 'Klaytn',
  'AXSUSDT': 'Axie Infinity',
  'ROSEUSDT': 'Oasis Network',
  'KSMUSDT': 'Kusama',
  'WAVESUSDT': 'Waves',
  'LUNAUSDT': 'Terra Luna Classic',
  'USTCUSDT': 'TerraClassicUSD',
  'GALAUSDT': 'Gala',
  'LRCUSDT': 'Loopring',
  'IMXUSDT': 'Immutable X',
  'APEUSDT': 'ApeCoin',
  'GMTUSDT': 'STEPN',
  'STXUSDT': 'Stacks',
  'ILVUSDT': 'Illuvium',
  'YGGUSDT': 'Yield Guild Games',
  'RENDERUSDT': 'Render Token',
  'JASMYUSDT': 'JasmyCoin',
  'WOOUSDT': 'WOO Network',
  'BELUSDT': 'Bella Protocol',
  'PEOPLEUSDT': 'ConstitutionDAO',
  'DYDXUSDT': 'dYdX',
  'ENSUSDT': 'Ethereum Name Service',
  'CHRUSDT': 'Chromia',
  'UNFIUSDT': 'Unifi Protocol DAO',
  'CVXUSDT': 'Convex Finance',
  'SPELLUSDT': 'Spell Token',
  'LDOUSDT': 'Lido DAO',
  'RAREUSDT': 'SuperRare',
  'ADXUSDT': 'AdEx',
  'ERNUSDT': 'Ethernity Chain',
  'KLAYUSDT': 'Klaytn',
  'FUNUSDT': 'FunFair',
  'USDCUSDT': 'USD Coin',
  'FDUSDUSDT': 'First Digital USD',
};

/**
 * Get cryptocurrency full name from symbol
 */
export function getCryptoName(symbol: string): string {
  const name = CRYPTO_NAME_MAP[symbol.toUpperCase()];
  if (name) return name;
  
  // Fallback: remove USDT and capitalize
  const cleanSymbol = symbol.replace('USDT', '').replace('BUSD', '');
  return cleanSymbol.charAt(0).toUpperCase() + cleanSymbol.slice(1).toLowerCase();
}

/**
 * Format volume number to human-readable string
 */
export function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(2)}B`;
  }
  if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(2)}M`;
  }
  if (volume >= 1e3) {
    return `${(volume / 1e3).toFixed(2)}K`;
  }
  return volume.toFixed(2);
}

/**
 * Extract symbol without USDT suffix
 */
export function extractSymbol(fullSymbol: string): string {
  return fullSymbol.replace('USDT', '').replace('BUSD', '');
}

/**
 * Transform backend crypto data to frontend format
 */
export function transformBackendData(backendData: BackendCryptoData[]): FrontendCryptoData[] {
  return backendData.map(crypto => {
    const symbol = extractSymbol(crypto.symbol);
    const name = getCryptoName(crypto.symbol);
    const formattedVolume = formatVolume(crypto.volume);
    
    return {
      symbol,
      name,
      price: crypto.price,
      change: crypto.priceChangePercent,
      volume: formattedVolume,
      signal: crypto.signal,
      chartData: crypto.priceHistory || [],
      detectionTime: new Date(crypto.lastUpdated),
      ta: crypto.ta
    };
  });
}

/**
 * Transform single backend crypto data item
 */
export function transformSingleBackendData(crypto: BackendCryptoData): FrontendCryptoData {
  return transformBackendData([crypto])[0]!;
}

/**
 * Map frontend detection settings to backend format
 */
export function mapSettingsToBackend(frontendSettings: {
  detectionModel: string;
  priceSensitivity: number;
  volumeSensitivity: number;
}) {
  // Frontend uses 0.1-2.0 scale, backend uses 1.001-2.0 scale
  const eps_price = 1 + (frontendSettings.priceSensitivity * 0.001);
  
  // Frontend uses 0.5-5.0 scale, backend uses 1.0-20.0 scale  
  const eps_volume = 1 + (frontendSettings.volumeSensitivity * 4);
  
  return {
    eps_price,
    eps_volume,
    model: frontendSettings.detectionModel as 'Logarithmic' | 'Exponential' | 'Parabolic'
  };
}

/**
 * Map backend detection settings to frontend format
 */
export function mapSettingsToFrontend(backendSettings: {
  eps_price: number;
  eps_volume: number;
  model: string;
}) {
  // Backend uses 1.001-2.0 scale, frontend uses 0.1-2.0 scale
  const priceSensitivity = (backendSettings.eps_price - 1) / 0.001;
  
  // Backend uses 1.0-20.0 scale, frontend uses 0.5-5.0 scale
  const volumeSensitivity = (backendSettings.eps_volume - 1) / 4;
  
  return {
    detectionModel: backendSettings.model,
    priceSensitivity: Math.max(0.1, Math.min(2.0, priceSensitivity)),
    volumeSensitivity: Math.max(0.5, Math.min(5.0, volumeSensitivity))
  };
}

/**
 * Validate transformed data
 */
export function validateTransformedData(data: FrontendCryptoData[]): boolean {
  return data.every(crypto => 
    typeof crypto.symbol === 'string' &&
    typeof crypto.name === 'string' &&
    typeof crypto.price === 'number' &&
    typeof crypto.change === 'number' &&
    typeof crypto.volume === 'string' &&
    typeof crypto.signal === 'string' &&
    Array.isArray(crypto.chartData) &&
    crypto.detectionTime instanceof Date
  );
}

/**
 * Sort data by signal priority (for consistent ordering)
 */
export function sortBySignalPriority(data: FrontendCryptoData[]): FrontendCryptoData[] {
  const signalPriority = {
    'STRONG_PUMP': 5,
    'PUMP': 4,
    'DUMP': 3,
    'NEUTRAL': 2,
    'GATHERING_DATA': 1
  };
  
  return [...data].sort((a, b) => {
    const aPriority = signalPriority[a.signal as keyof typeof signalPriority] || 0;
    const bPriority = signalPriority[b.signal as keyof typeof signalPriority] || 0;
    return bPriority - aPriority;
  });
}
