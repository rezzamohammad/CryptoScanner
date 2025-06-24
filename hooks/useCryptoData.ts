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
    chartData: Array.from({ length: 24 }, (_, i) => ({
      time: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      price: 43000 + Math.random() * 500,
      volume: Math.random() * 1000000000
    }))
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
      if (!isThemeLoaded) return;

      try {
        setConnectionStatus('connecting');
        console.log('🔄 Fetching initial crypto data...');

        const response = await retryWithBackoff(
          () => ApiClient.getCryptoData(),
          3,
          1000
        );

        if (!isMounted) return;

        if (response && Array.isArray(response)) {
          const transformedData = response.map(transformBackendData);
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

        // Fallback to mock data if enabled
        const useMockFallback = process.env.NEXT_PUBLIC_ENABLE_MOCK_FALLBACK === 'true';
        if (useMockFallback) {
          console.log('🔄 Falling back to mock data due to API error');
          setCryptoData(MOCK_CRYPTO_DATA);
          setConnectionStatus('connected');
        }
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [isThemeLoaded]);

  // WebSocket connection management
  useEffect(() => {
    if (!isThemeLoaded || connectionStatus !== 'connected') return;

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        console.log('🔌 Connecting to WebSocket...');

        wsClient.connect({
          onOpen: () => {
            console.log('✅ WebSocket connected');
            setConnectionStatus('connected');
            reconnectAttempts = 0;
          },
          onMessage: (data) => {
            try {
              if (Array.isArray(data)) {
                const transformedData = data.map(transformBackendData);
                setCryptoData(transformedData);
                setLastUpdateTime(new Date());
                console.log('📊 Received WebSocket update:', transformedData.length, 'items');
              }
            } catch (error) {
              console.error('❌ Error processing WebSocket data:', error);
              logError(error, { context: 'websocket_data_processing' });
            }
          },
          onError: (error) => {
            console.error('❌ WebSocket error:', error);
            setConnectionStatus('error');
            logError(error, { context: 'websocket_connection' });
          },
          onClose: () => {
            console.log('🔌 WebSocket disconnected');
            setConnectionStatus('disconnected');

            // Attempt to reconnect with exponential backoff
            if (reconnectAttempts < maxReconnectAttempts) {
              const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
              console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
              
              reconnectTimeout = setTimeout(() => {
                reconnectAttempts++;
                connectWebSocket();
              }, delay);
            } else {
              console.error('❌ Max reconnection attempts reached');
              setConnectionStatus('error');
            }
          }
        });
      } catch (error) {
        console.error('❌ Failed to connect WebSocket:', error);
        setConnectionStatus('error');
        logError(error, { context: 'websocket_connection_init' });
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      wsClient.disconnect();
    };
  }, [isThemeLoaded, connectionStatus]);

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