import { useState, useEffect } from 'react';

export interface UseThemeReturn {
  isDark: boolean;
  isThemeLoaded: boolean;
  setIsDark: (dark: boolean) => void;
}

export function useTheme(): UseThemeReturn {
  const [isDark, setIsDark] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Load theme preference on mount to prevent hydration mismatch
  useEffect(() => {
    const savedTheme = localStorage.getItem('crypto-scanner-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldUseDark);
    setIsThemeLoaded(true);
    
    // Apply theme to document element
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Update document theme class when isDark changes
  useEffect(() => {
    if (isThemeLoaded) {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('crypto-scanner-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('crypto-scanner-theme', 'light');
      }
    }
  }, [isDark, isThemeLoaded]);

  return {
    isDark,
    isThemeLoaded,
    setIsDark
  };
}