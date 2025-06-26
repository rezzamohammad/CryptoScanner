import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/lib/apiClient';
import { mapSettingsToBackend } from '@/lib/dataTransformers';
import { handleApiError, logError } from '@/lib/errorHandling';

export interface DetectionSettings {
  detectionModel: string;
  priceSensitivity: number;
  volumeSensitivity: number;
}

export interface UseDetectionSettingsReturn {
  detectionModel: string;
  priceSensitivity: number;
  volumeSensitivity: number;
  settingsLoading: boolean; // For localStorage operations (🟢)
  backendSyncing: boolean;  // For backend API operations (⚙️ Syncing...)
  setDetectionModel: (model: string) => void;
  setPriceSensitivity: (sensitivity: number) => void;
  setVolumeSensitivity: (sensitivity: number) => void;
}

export function useDetectionSettings(isThemeLoaded: boolean): UseDetectionSettingsReturn {
  const [detectionModel, setDetectionModel] = useState('Logarithmic');
  const [priceSensitivity, setPriceSensitivity] = useState(0.9);
  const [volumeSensitivity, setVolumeSensitivity] = useState(1.5);
  const [settingsLoading, setSettingsLoading] = useState(false); // For localStorage operations
  const [backendSyncing, setBackendSyncing] = useState(false);   // For backend API operations

  // Settings synchronization state management
  const [settingsState, setSettingsState] = useState({
    isSyncing: false,
    lastSyncTime: null as number | null,
    pendingChanges: false,
    syncRetryCount: 0,
    maxRetries: 3
  });

  // Settings synchronization function
  const syncSettings = useCallback(async (settings: {
    detectionModel: string;
    priceSensitivity: number;
    volumeSensitivity: number;
  }) => {
    // Step 1: Save to localStorage immediately with loading indicator
    setSettingsLoading(true);

    const localSettings = {
      detectionModel: settings.detectionModel,
      priceSensitivity: settings.priceSensitivity,
      volumeSensitivity: settings.volumeSensitivity
    };
    localStorage.setItem('crypto-detection-settings', JSON.stringify(localSettings));
    console.log('💾 Settings saved to localStorage:', localSettings);

    // Brief delay to show the localStorage loading indicator
    setTimeout(() => setSettingsLoading(false), 200);

    // Step 2: Sync with backend API if available
    const useBackendApi = process.env.NEXT_PUBLIC_ENABLE_BACKEND_API === 'true';
    if (!useBackendApi) {
      console.log('ℹ️ Backend API disabled, using localStorage only');
      return;
    }

    // Prevent concurrent backend sync operations
    if (settingsState.isSyncing) {
      console.log('⚠️ Backend settings sync already in progress, skipping...');
      return;
    }

    setSettingsState(prev => ({ ...prev, isSyncing: true }));
    setBackendSyncing(true);

    try {
      console.log('🔄 Syncing settings with backend...');
      const backendSettings = mapSettingsToBackend(settings);
      await ApiClient.updateSettings(backendSettings);
      console.log('⚙️ Settings synchronized with backend:', backendSettings);

      // Success: Update sync state
      setSettingsState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: Date.now(),
        pendingChanges: false,
        syncRetryCount: 0
      }));

    } catch (error) {
      const apiError = handleApiError(error);
      logError(apiError, 'Settings Sync');
      console.error('❌ Failed to sync settings with backend:', apiError.message);

      // Handle sync failure with retry logic
      setSettingsState(prev => {
        const newRetryCount = prev.syncRetryCount + 1;
        const shouldRetry = newRetryCount < prev.maxRetries;

        if (shouldRetry) {
          console.log(`🔄 Scheduling settings sync retry ${newRetryCount}/${prev.maxRetries}`);
          // Schedule retry with exponential backoff
          setTimeout(() => {
            syncSettings(settings);
          }, Math.min(1000 * Math.pow(2, newRetryCount - 1), 10000));
        }

        return {
          ...prev,
          isSyncing: false,
          pendingChanges: !shouldRetry, // Mark as pending if no more retries
          syncRetryCount: newRetryCount
        };
      });
    } finally {
      setBackendSyncing(false);
    }
  }, [settingsState.isSyncing, settingsState.syncRetryCount, settingsState.maxRetries]);

  // Load detection settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('crypto-detection-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.detectionModel) setDetectionModel(settings.detectionModel);
        if (typeof settings.priceSensitivity === 'number') setPriceSensitivity(settings.priceSensitivity);
        if (typeof settings.volumeSensitivity === 'number') setVolumeSensitivity(settings.volumeSensitivity);
        console.log('🔧 Loaded detection settings from localStorage:', settings);
      } catch (error) {
        console.error('❌ Error loading detection settings:', error);
      }
    } else {
      console.log('🔧 No saved detection settings found, using defaults');
    }
  }, []);

  // Settings change handler with debouncing
  useEffect(() => {
    if (!isThemeLoaded) return;

    // Debounce settings updates to avoid too many sync calls
    const timeoutId = setTimeout(() => {
      syncSettings({
        detectionModel,
        priceSensitivity,
        volumeSensitivity
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [detectionModel, priceSensitivity, volumeSensitivity, isThemeLoaded, syncSettings]);

  return {
    detectionModel,
    priceSensitivity,
    volumeSensitivity,
    settingsLoading,
    backendSyncing,
    setDetectionModel,
    setPriceSensitivity,
    setVolumeSensitivity
  };
}