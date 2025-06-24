/**
 * AI Analysis Type Definitions
 * Extracted from AIStrategyModal.tsx for better type safety and reusability
 */

// Data Quality Types
export type DataQuality = 'ai-generated' | 'enhanced' | 'fallback' | 'error-state';

// Technical Indicators Types
export interface RSIData {
  CurrentRSI: string;
  Status?: string;
  Interpretation?: string;
}

export interface MACDData {
  Status: string;
  Signal?: string;
  Histogram?: string;
  Interpretation?: string;
}

export interface BollingerBandsData {
  Status: string;
  PricePosition: string;
  UpperBand?: string;
  LowerBand?: string;
  MiddleBand?: string;
  Interpretation?: string;
}

export interface MovingAveragesData {
  SMA20?: string;
  SMA50?: string;
  EMA12?: string;
  EMA26?: string;
  Status?: string;
  Interpretation?: string;
}

export interface VolumeData {
  CurrentVolume?: string;
  AverageVolume?: string;
  VolumeRatio?: string;
  Status?: string;
  Interpretation?: string;
}

export interface TechnicalIndicators {
  RSI?: RSIData;
  MACD?: MACDData;
  BollingerBands?: BollingerBandsData;
  MovingAverages?: MovingAveragesData;
  Volume?: VolumeData;
}

// Price Action Types
export interface PriceAction {
  CurrentPrice?: string;
  RecentHigh?: string;
  RecentLow?: string;
  KeySupport?: string;
  KeyResistance?: string;
  PriceAnalysis?: string;
  TrendDirection?: string;
  Momentum?: string;
}

// Scenario Analysis Types
export interface ScenarioAnalysis {
  BullishScenario?: string;
  BearishScenario?: string;
  NeutralScenario?: string;
  ProbabilityBullish?: number;
  ProbabilityBearish?: number;
  ProbabilityNeutral?: number;
}

// Risk Assessment Types
export interface RiskAssessment {
  RiskLevel?: 'Low' | 'Medium' | 'High' | 'Very High';
  RiskWarning?: string;
  StopLoss?: string;
  TakeProfit?: string;
  RiskRewardRatio?: string;
}

// Main Analysis Data Interface
export interface AnalysisData {
  // Core Analysis
  Reason?: string;
  SuggestedStrategy?: string;
  ConfidenceScore?: number;

  // Technical Analysis
  TechnicalIndicators?: TechnicalIndicators;
  PriceAction?: PriceAction;

  // Scenario Analysis
  ScenarioAnalysis?: ScenarioAnalysis;

  // Risk Management
  RiskAssessment?: RiskAssessment;

  // Additional Fields
  MarketSentiment?: string;
  NewsImpact?: string;
  TimeFrame?: string;
  LastUpdated?: string;
}

// Analysis Data with Quality Metadata
export interface AnalysisDataWithQuality extends AnalysisData {
  _dataQuality: DataQuality;
  _timestamp: number;
  _retryCount: number;
  _source?: 'api' | 'fallback' | 'enhanced';
  _validationErrors?: string[];
}

// AI Modal Props
export interface AIStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  isDark: boolean;
}

// AI Analysis Request/Response Types
export interface AIAnalysisRequest {
  symbol: string;
  timeframe?: string;
  includeScenarios?: boolean;
  includeTechnicals?: boolean;
}

export interface AIAnalysisResponse {
  success: boolean;
  data?: {
    analysis: AnalysisData;
    metadata?: {
      processingTime: number;
      dataSource: string;
      confidence: number;
    };
  };
  error?: string;
  timestamp: number;
}

// Loading States
export interface AILoadingState {
  isLoading: boolean;
  stage: 'idle' | 'fetching' | 'processing' | 'validating' | 'complete' | 'error';
  progress?: number;
  message?: string;
}

// Error Types
export interface AIAnalysisError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  timestamp: number;
}

// Text Expansion State
export interface TextExpansionState {
  [sectionKey: string]: boolean;
}

// Component State Types
export interface AIModalState {
  isLoading: boolean;
  analysisData: AnalysisDataWithQuality | null;
  error: string | null;
  mounted: boolean;
  dataQuality: DataQuality;
  expandedSections: TextExpansionState;
}

// Validation Types (re-exported from validation service)
export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  invalidFields: string[];
  errors: string[];
}

// Enhanced Data Derivation Types
export interface TechnicalAnalysisData {
  sma: number;
  rsi: number;
  high: number;
  low: number;
  priceVsSma: 'Above' | 'Below';
  bollingerBands: {
    upper: string;
    lower: string;
    middle: string;
  };
}

export interface SupportResistanceData {
  support: string;
  resistance: string;
  confidence: number;
}

// Market Data Types for Enhancement
export interface MarketDataResponse {
  success: boolean;
  data?: {
    symbol: string;
    price: number;
    change24h: number;
    volume24h: number;
    historicalData?: {
      priceHistory: number[];
      volumeHistory: number[];
      timestamps: number[];
    };
  };
  error?: string;
}

// Calculation Helper Types
export interface RSICalculationData {
  gains: number[];
  losses: number[];
  avgGain: number;
  avgLoss: number;
  rs: number;
  rsi: number;
}

export interface BollingerBandsCalculation {
  upper: string;
  lower: string;
  middle: string;
  bandwidth: number;
  percentB: number;
}

// API Error Types
export interface APIError {
  message: string;
  code?: string;
  status?: number;
  retryable: boolean;
  timestamp: number;
}

// Fallback Data Generation Types
export interface FallbackDataOptions {
  symbol: string;
  includeScenarios: boolean;
  includeTechnicals: boolean;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
}

// Text Processing Types
export interface TextProcessingOptions {
  maxLength: number;
  preserveFormatting: boolean;
  includeMarkdown: boolean;
  truncateAtSentence: boolean;
}

// Component Props for Sub-components
export interface AIAnalysisContentProps {
  analysisData: AnalysisDataWithQuality;
  isDark: boolean;
  expandedSections: TextExpansionState;
  onToggleExpansion: (sectionKey: string) => void;
}

export interface TechnicalIndicatorsProps {
  indicators: TechnicalIndicators;
  isDark: boolean;
}

export interface StrategyRecommendationProps {
  strategy: string;
  confidence: number;
  analysisData: AnalysisData;
  isDark: boolean;
}

export interface ConfidenceScoreProps {
  score: number;
  dataQuality: DataQuality;
  isDark: boolean;
}

export interface ScenarioAnalysisProps {
  scenarios: ScenarioAnalysis;
  isDark: boolean;
  expandedSections: TextExpansionState;
  onToggleExpansion: (sectionKey: string) => void;
}

export interface AILoadingStateProps {
  isLoading: boolean;
  stage: AILoadingState['stage'];
  progress?: number;
  message?: string;
  isDark: boolean;
}