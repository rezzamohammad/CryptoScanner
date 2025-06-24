/**
 * StrategySection Component
 * 
 * Displays AI strategy recommendations with confidence scoring,
 * main strategy content, and educational information
 */

'use client';


import { AIResponseValidator } from '../../services/aiValidationService';
import { 
  formatLongText as formatText, 
  enrichStrategyContent as enrichStrategy 
} from '../../utils/textFormatters';
import { AnalysisDataWithQuality, DataQuality } from '../../types/ai';

interface StrategySectionProps {
  analysisData: AnalysisDataWithQuality;
  isDark: boolean;
  dataQuality: DataQuality;
  expandedSections: {[key: string]: boolean};
  onToggleExpansion: (sectionKey: string) => void;
}

export function StrategySection({ 
  analysisData, 
  isDark, 
  dataQuality,
  expandedSections, 
  onToggleExpansion 
}: StrategySectionProps) {
  
  // Calculate confidence score
  const calculateConfidence = () => {
    let confidence = 50; // Base confidence
    if (analysisData.TechnicalIndicators?.RSI?.CurrentRSI) confidence += 15;
    if (analysisData.TechnicalIndicators?.Volume?.Status?.includes('spike')) confidence += 20;
    if (analysisData.Reason && analysisData.Reason.length > 50) confidence += 10;
    if (analysisData.SuggestedStrategy && analysisData.SuggestedStrategy.length > 30) confidence += 5;

    // Additional confidence factors for more realistic scoring
    if (analysisData.TechnicalIndicators?.MACD?.Status && analysisData.TechnicalIndicators.MACD.Status !== 'Neutral') confidence += 8;
    if (analysisData.TechnicalIndicators?.BollingerBands?.PricePosition && analysisData.TechnicalIndicators.BollingerBands.PricePosition !== 'Middle Band') confidence += 7;
    if (analysisData.PriceAction?.KeySupport && analysisData.PriceAction?.KeyResistance) confidence += 5;

    return Math.min(confidence, 100); // Natural 100% cap
  };

  const confidence = calculateConfidence();

  return (
    <div className={`p-4 rounded-xl relative ${
      isDark ? 'bg-gray-700/50 neon-green-sm' : 'bg-gray-50'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        <span className="mr-2">🎯</span>
        AI Strategy & Risk Assessment
      </h3>

      {/* AI Confidence Score */}
      <div className={`p-3 rounded-lg mb-4 ${
        isDark ? 'bg-purple-900/20 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${
            isDark ? 'text-purple-300' : 'text-purple-700'
          }`}>
            AI Confidence Score (Next 4 Hours)
          </span>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            confidence >= 80
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : confidence >= 60
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            {confidence}%
          </div>
        </div>
        <div className={`text-xs ${
          isDark ? 'text-purple-300/70' : 'text-purple-600/70'
        }`}>
          Based on technical indicator confluence and data quality
        </div>
      </div>

      {/* Main Strategy Content */}
      <div className={`p-4 rounded-lg mb-4 ${
        isDark ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
      }`}>
        <div className={`text-sm font-medium mb-2 ${
          isDark ? 'text-blue-300' : 'text-blue-700'
        }`}>
          Primary Strategy Recommendation
        </div>
        {(() => {
          const originalStrategyText = analysisData.SuggestedStrategy || 'Strategy analysis not available from AI';
          const enrichedStrategyText = enrichStrategy(originalStrategyText, analysisData, 250);
          const { formatted, isTruncated, fullText } = formatText(enrichedStrategyText, 250);
          const isExpanded = expandedSections['strategy'];
          const displayText = isExpanded ? fullText : formatted;

          return (
            <div>
              <div className={`leading-relaxed ${
                isDark ? 'text-blue-200' : 'text-blue-800'
              }`}>
                {(() => {
                  const sanitizedText = AIResponseValidator.sanitizeContent(displayText, 250);
                  // Enhanced rendering with markdown-like formatting
                  const parts = sanitizedText.split(/(\*\*[^*]+\*\*)/g);

                  return (
                    <div className="whitespace-pre-line">
                      {parts.map((part, index) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          const boldText = part.slice(2, -2);
                          return (
                            <span key={index} className="font-semibold text-blue-100 dark:text-blue-50">
                              {boldText}
                            </span>
                          );
                        }
                        return part;
                      })}
                    </div>
                  );
                })()}
              </div>
              {isTruncated && (
                <button
                  onClick={() => onToggleExpansion('strategy')}
                  className={`mt-3 px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                    isDark
                      ? 'bg-blue-800/50 text-blue-200 hover:bg-blue-700/60 hover:text-blue-100 border border-blue-600/30'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 border border-blue-300'
                  }`}
                >
                  {isExpanded ? '📖 Show Less' : '📚 Read More'}
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* Trading Education Section for Beginners */}
      <div className={`p-4 rounded-lg mb-4 ${
        isDark ? 'bg-indigo-900/20 border border-indigo-500/30' : 'bg-indigo-50 border border-indigo-200'
      }`}>
        <div className={`text-sm font-medium mb-3 flex items-center ${
          isDark ? 'text-indigo-300' : 'text-indigo-700'
        }`}>
          <span className="mr-2">🎓</span>
          Quick Trading Guide
        </div>
        <div className={`text-sm space-y-2 ${
          isDark ? 'text-indigo-200' : 'text-indigo-800'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <strong>RSI Explained:</strong>
              <br />• Above 70 = Overbought (may fall)
              <br />• Below 30 = Oversold (may rise)
              <br />• 30-70 = Neutral zone
            </div>
            <div>
              <strong>Volume Spikes:</strong>
              <br />• High volume = Strong interest
              <br />• Volume confirms price moves
              <br />• Low volume = Weak signals
            </div>
            <div>
              <strong>Support/Resistance:</strong>
              <br />• Support = Price floor (buying interest)
              <br />• Resistance = Price ceiling (selling pressure)
              <br />• Breaks = Potential trend changes
            </div>
            <div>
              <strong>Risk Management:</strong>
              <br />• Never risk more than 2% per trade
              <br />• Set stop-losses before entering
              <br />• Take profits at resistance levels
            </div>
          </div>
        </div>
      </div>

      {/* Professional Summary for Advanced Traders */}
      <div className={`p-4 rounded-lg mb-4 ${
        isDark ? 'bg-gray-800/50 border border-gray-600/30' : 'bg-gray-100 border border-gray-300'
      }`}>
        <div className={`text-sm font-medium mb-3 flex items-center ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <span className="mr-2">⚡</span>
          Professional Summary
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Signal Strength
            </div>
            <div className={`${
              (() => {
                let strength = 0;
                if (analysisData.TechnicalIndicators?.RSI?.CurrentRSI) strength += 1;
                if (analysisData.TechnicalIndicators?.Volume?.Status?.includes('spike')) strength += 2;
                if (analysisData.Reason && analysisData.Reason.length > 50) strength += 1;

                return strength >= 3 ? 'text-green-500' : strength >= 2 ? 'text-yellow-500' : 'text-red-500';
              })()
            }`}>
              {(() => {
                let strength = 0;
                if (analysisData.TechnicalIndicators?.RSI?.CurrentRSI) strength += 1;
                if (analysisData.TechnicalIndicators?.Volume?.Status?.includes('spike')) strength += 2;
                if (analysisData.Reason && analysisData.Reason.length > 50) strength += 1;

                return strength >= 3 ? 'STRONG' : strength >= 2 ? 'MODERATE' : 'WEAK';
              })()}
            </div>
          </div>
          <div>
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Data Quality
            </div>
            <div className={`${
              dataQuality === 'ai-generated' ? 'text-green-500' : 'text-yellow-500'
            }`}>
              {dataQuality === 'ai-generated' ? 'HIGH' : 'PARTIAL'}
            </div>
          </div>
          <div>
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Time Frame
            </div>
            <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              4H Analysis
            </div>
          </div>
          <div>
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Last Updated
            </div>
            <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {analysisData._timestamp ?
                new Date(analysisData._timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) :
                'Just now'
              }
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
