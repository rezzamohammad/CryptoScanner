/**
 * AIStrategyModal Component - Enhanced with Comprehensive Validation & Error Handling
 *
 * This component implements a robust AI analysis modal with:
 *
 * 🔍 VALIDATION FRAMEWORK:
 * - Comprehensive response validation for all required fields
 * - Data type and format validation (RSI ranges, price formats, content length)
 * - Logical consistency checks and content sanitization
 *
 * 🔄 GRANULAR RETRY MECHANISM:
 * - Selective field retry logic (max 3 attempts per field)
 * - Preserves valid data while retrying only incomplete fields
 * - Tracks retry state to prevent infinite loops
 *
 * 🛡️ TIERED FALLBACK SYSTEM:
 * - Tier 1: Retry incomplete fields with modified prompts
 * - Tier 2: Field-specific default templates with symbol data
 * - Tier 3: User-friendly error state with manual refresh
 *
 * 🎨 ENHANCED UX:
 * - Progressive loading states for individual sections
 * - Data quality indicators (AI Generated vs Fallback)
 * - Partial results display during retries
 * - Manual refresh functionality
 * - Visual retry indicators with spinning loaders
 *
 * 🧹 DATA SANITIZATION:
 * - Content validation and harmful character removal
 * - Consistent formatting across all text fields
 * - Numerical data range validation
 * - Length limits and whitespace normalization
 *
 * @author AI Assistant
 * @version 2.0.0 - Enhanced Validation & Error Handling
 */

'use client';

import { X, Sparkles, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// Note: ApiClient import removed - now using AIAnalysisService
import { handleApiError, logError } from '../lib/errorHandling';

// Import our extracted services and utilities
import { AIAnalysisService } from '../services/aiAnalysisService';
import {
  AnalysisDataWithQuality,
  DataQuality,
  AIStrategyModalProps
} from '../types/ai';

// Import extracted UI components
import { LoadingState } from './AIStrategyModal/LoadingState';
import { ErrorState } from './AIStrategyModal/ErrorState';
import { TechnicalAnalysisSection } from './AIStrategyModal/TechnicalAnalysisSection';
import { TechnicalIndicatorsDashboard } from './AIStrategyModal/TechnicalIndicatorsDashboard';
import { PriceActionSection } from './AIStrategyModal/PriceActionSection';
import { StrategySection } from './AIStrategyModal/StrategySection';
import { ScenarioAnalysisSection } from './AIStrategyModal/ScenarioAnalysisSection';

// Note: Types have been extracted to types/ai.ts
// Note: AIResponseValidator has been extracted to services/aiValidationService.ts

export function AIStrategyModal({ isOpen, onClose, symbol, isDark }: AIStrategyModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<AnalysisDataWithQuality | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Simplified state management
  const [dataQuality, setDataQuality] = useState<DataQuality>('ai-generated');

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simplified AI Analysis using extracted service
  const fetchAIAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAnalysisData(null);

      // Use the extracted AI Analysis Service
      const analysisData = await AIAnalysisService.fetchAIAnalysis(symbol);

      if (analysisData) {
        setAnalysisData(analysisData);
        setDataQuality(analysisData._dataQuality);
        console.log(`✅ AI analysis completed successfully for ${symbol}`);
      } else {
        throw new Error('No analysis data received from service');
      }

    } catch (error) {
      const apiError = handleApiError(error);
      logError(apiError, 'AI Analysis');
      setError(apiError.message);
      setAnalysisData(null);
      setDataQuality('error-state');
    } finally {
      setIsLoading(false);
    }
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchAIAnalysis();
  };

  // Note: formatLongText has been extracted to utils/textFormatters.ts

  // State for expanded text sections
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  const toggleTextExpansion = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Note: enrichAnalysisContent and enrichStrategyContent have been extracted to utils/textFormatters.ts

  // Note: deriveAdditionalData has been moved to services/aiAnalysisService.ts

  // Note: All calculation functions have been moved to services/aiAnalysisService.ts

  useEffect(() => {
    if (isOpen && symbol) {
      fetchAIAnalysis();
    }
  }, [isOpen, symbol]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 backdrop-blur-sm ${
          isDark ? 'bg-dark/25 backdrop-blur-sm border border-gray-700/75 hover:bg-dark/25' : 'bg-white/75 backdrop-blur-sm border border-gray-200 hover:bg-white/75 neon-green-md'
        }`}
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-300 ease-out scale-100 ${
          isDark
            ? 'bg-black/75 backdrop-blur-sm border border-gray-700/75 hover:bg-black/75 neon-green-lg'
            : 'bg-white/75 backdrop-blur-sm border border-gray-200 hover:bg-white/75 neon-green-md'
        }`}
        style={{
          position: 'relative',
          zIndex: 10000,
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center neon-teal-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              AI Strategy Report: {symbol}
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white neon-green-sm' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {isLoading ? (
            <LoadingState isDark={isDark} symbol={symbol} />
          ) : analysisData ? (
            <div className="space-y-6">
              {/* Data Quality Indicator and Refresh Button */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    dataQuality === 'ai-generated'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {dataQuality === 'ai-generated' ? '🤖 AI Analysis Successfully Generated' : '❌ AI Analysis Failed'}
                  </div>
                </div>
                <button
                  onClick={handleManualRefresh}
                  disabled={isLoading}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-50'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </div>

              {/* Technical Analysis Section */}
              <TechnicalAnalysisSection
                analysisData={analysisData}
                isDark={isDark}
                expandedSections={expandedSections}
                onToggleExpansion={toggleTextExpansion}
              />

              {/* Technical Indicators Dashboard */}
              <TechnicalIndicatorsDashboard
                analysisData={analysisData}
                isDark={isDark}
              />

              {/* Price Action Section */}
              <PriceActionSection
                analysisData={analysisData}
                isDark={isDark}
              />

              {/* Strategy Section */}
              <StrategySection
                analysisData={analysisData}
                isDark={isDark}
                dataQuality={dataQuality}
                expandedSections={expandedSections}
                onToggleExpansion={toggleTextExpansion}
              />

              {/* Scenario Analysis Section */}
              <ScenarioAnalysisSection
                analysisData={analysisData}
                isDark={isDark}
                expandedSections={expandedSections}
                onToggleExpansion={toggleTextExpansion}
              />

              {/* Risk Warning - Always show financial safety disclaimer at the end */}
              <div className={`bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 neon-teal-md`}>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-white mt-0.5 flex-shrink-0">⚠️</div>
                  <div className="text-white text-sm">
                    <p className="font-medium mb-2">IMPORTANT RISK DISCLAIMER</p>
                    <p className="text-xs opacity-90">
                      This AI analysis is for informational purposes only and should not be considered financial advice.
                      Cryptocurrency trading involves substantial risk of loss. Always conduct your own research and
                      never trade with money you cannot afford to lose.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ErrorState
              isDark={isDark}
              symbol={symbol}
              error={error}
              isLoading={isLoading}
              onRetry={handleManualRefresh}
            />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}