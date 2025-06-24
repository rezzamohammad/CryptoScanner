import { useState, useEffect } from 'react';

export interface DetectionSettings {
  detectionModel: string;
  priceSensitivity: number;
  volumeSensitivity: number;
}

export interface UseDetectionSettingsReturn {
  detectionModel: string;
  priceSensitivity: number;
  volumeSensitivity: number;
  setDetectionModel: (model: string) => void;
  setPriceSensitivity: (sensitivity: number) => void;
  setVolumeSensitivity: (sensitivity: number) => void;
}

export function useDetectionSettings(isThemeLoaded: boolean): UseDetectionSettingsReturn {
  const [detectionModel, setDetectionModel] = useState('Logarithmic');
  const [priceSensitivity, setPriceSensitivity] = useState(0.9);
  const [volumeSensitivity, setVolumeSensitivity] = useState(1.5);

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

  // Save detection settings to localStorage whenever they change
  useEffect(() => {
    // Skip saving on initial load (when isThemeLoaded is false)
    if (!isThemeLoaded) return;

    const settings = {
      detectionModel,
      priceSensitivity,
      volumeSensitivity
    };
    localStorage.setItem('crypto-detection-settings', JSON.stringify(settings));
    console.log('💾 Saved detection settings to localStorage:', settings);
  }, [detectionModel, priceSensitivity, volumeSensitivity, isThemeLoaded]);

  return {
    detectionModel,
    priceSensitivity,
    volumeSensitivity,
    setDetectionModel,
    setPriceSensitivity,
    setVolumeSensitivity
  };
}