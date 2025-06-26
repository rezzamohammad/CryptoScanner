import { useState, useEffect, useCallback } from 'react';
import { ApiClient, wsClient } from '@/lib/apiClient';
import { transformBackendData, mapSettingsToBackend, type FrontendCryptoData } from '@/lib/dataTransformers';
import { handleApiError, retryWithBackoff, logError } from '@/lib/errorHandling';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface UseCryptoDataReturn {
  cryptoData: FrontendCryptoData[];
  connectionStatus: ConnectionStatus;
  lastUpdateTime: Date | null;
  setCryptoData: (data: FrontendCryptoData[]) => void;
}

const MOCK_CRYPTO_DATA: FrontendCryptoData[] = [
  {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    price: 43250.75,
    priceChange: 1250.30,
    priceChangePercent: 2.98,
    volume: '28.5B',
    volumeValue: 28500000000,
    signal: 'PUMP',
    detectionTime: new Date(),
    chartData: Array.from({ length: 24 }, (_, i) =>
      43000 + Math.random() * 500
    )
  }
];

export function useCryptoData(
  detectionModel: string,
  priceSensitivity: number,
  volumeSensitivity: number,
  isThemeLoaded: boolean
): UseCryptoDataReturn {
  const [cryptoData, setCryptoData] = useState<FrontendCryptoData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Sync settings with backend
  const syncSettings = useCallback(async () => {
    if (!isThemeLoaded) return;

    try {
      const backendSettings = mapSettingsToBackend({
        detectionModel,
        priceSensitivity,
        volumeSensitivity
      });

      console.log('🔄 Syncing settings with backend:', backendSettings);
      await ApiClient.updateSettings(backendSettings);
      console.log('✅ Settings synced successfully');
    } catch (error) {
      console.error('❌ Failed to sync settings:', error);
    }
  }, [detectionModel, priceSensitivity, volumeSensitivity, isThemeLoaded]);

  // Initial data fetch
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      if (!isThemeLoaded) {
        console.log('⏳ Theme not loaded yet, skipping data fetch');
        return;
      }

      try {
        setConnectionStatus('connecting');
        console.log('🔄 Fetching initial crypto data from:', 'http://localhost:3001/api/market/tickers');

        const response = await retryWithBackoff(
          () => ApiClient.getTickers({ limit: 100 }),
          3
        );

        if (!isMounted) return;

        if (response && response.success && Array.isArray(response.data)) {
          const transformedData = transformBackendData(response.data);
          setCryptoData(transformedData);
          setConnectionStatus('connected');
          setLastUpdateTime(new Date());
          console.log('✅ Initial data loaded successfully:', transformedData.length, 'items');
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        if (!isMounted) return;

        console.error('❌ Failed to fetch initial data:', error);
        handleApiError(error);
        setConnectionStatus('error');

        // Keep error state - no mock fallback
        console.log('❌ API connection failed - waiting for backend connection');
        setCryptoData([]);
        setConnectionStatus('error');
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [isThemeLoaded]);

  // WebSocket connection management
  useEffect(() => {
    if (!isThemeLoaded) return;

    console.log('🔌 Setting up WebSocket listeners...');

    // Handle WebSocket connection events
    const handleConnected = () => {
      console.log('✅ WebSocket connected');
      setConnectionStatus('connected');
    };

    const handleMarketUpdate = (payload: any) => {
      try {
        if (payload && Array.isArray(payload.data)) {
          const transformedData = transformBackendData(payload.data);
          setCryptoData(transformedData);
          setLastUpdateTime(new Date());
          console.log('📊 Received WebSocket update:', transformedData.length, 'items');
        }
      } catch (error) {
        console.error('❌ Error processing WebSocket data:', error);
        logError(error as Error, 'websocket_data_processing');
      }
    };

    const handleError = (error: any) => {
      console.error('❌ WebSocket error:', error);
      setConnectionStatus('error');
      logError(error as Error, 'websocket_connection');
    };

    const handleDisconnected = () => {
      console.log('🔌 WebSocket disconnected');
      setConnectionStatus('disconnected');
    };

    // Add event listeners
    wsClient.on('connected', handleConnected);
    wsClient.on('market_update', handleMarketUpdate);
    wsClient.on('error', handleError);
    wsClient.on('disconnected', handleDisconnected);

    return () => {
      // Clean up event listeners
      wsClient.off('connected', handleConnected);
      wsClient.off('market_update', handleMarketUpdate);
      wsClient.off('error', handleError);
      wsClient.off('disconnected', handleDisconnected);
    };
  }, [isThemeLoaded]);

  // Sync settings when they change
  useEffect(() => {
    syncSettings();
  }, [syncSettings]);

  return {
    cryptoData,
    connectionStatus,
    lastUpdateTime,
    setCryptoData
  };
}