/**
 * TechnicalAnalysisSection Component
 * 
 * Displays the main technical analysis summary with expandable text
 * and key technical highlights (RSI and Volume)
 */

'use client';

import { AIResponseValidator } from '../../services/aiValidationService';
import { 
  formatLongText as formatText, 
  enrichAnalysisContent as enrichContent 
} from '../../utils/textFormatters';
import { AnalysisDataWithQuality } from '../../types/ai';

interface TechnicalAnalysisSectionProps {
  analysisData: AnalysisDataWithQuality;
  isDark: boolean;
  expandedSections: {[key: string]: boolean};
  onToggleExpansion: (sectionKey: string) => void;
}

export function TechnicalAnalysisSection({ 
  analysisData, 
  isDark, 
  expandedSections, 
  onToggleExpansion 
}: TechnicalAnalysisSectionProps) {
  return (
    <div className={`p-4 rounded-xl relative ${
      isDark ? 'bg-gray-700/50 neon-green-sm' : 'bg-gray-50'
    }`}>
      <h3 className={`text-lg font-semibold mb-3 flex items-center ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        <span className="mr-2">🎯</span>
        Technical Analysis Summary
      </h3>

      {/* Main Analysis */}
      <div className={`p-3 rounded-lg mb-4 ${
        isDark ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
      }`}>
        {(() => {
          const originalReasonText = analysisData.Reason || 'Technical analysis data not available';
          const enrichedReasonText = enrichContent(originalReasonText, analysisData, 300);
          const { formatted, isTruncated, fullText } = formatText(enrichedReasonText, 300);
          const isExpanded = expandedSections['reason'];
          const displayText = isExpanded ? fullText : formatted;

          return (
            <div>
              <div className={`leading-relaxed ${
                isDark ? 'text-blue-200' : 'text-blue-800'
              }`}>
                {(() => {
                  const sanitizedText = AIResponseValidator.sanitizeContent(displayText, 300);
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
                  onClick={() => onToggleExpansion('reason')}
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

      {/* Key Technical Highlights */}
      {analysisData.TechnicalIndicators && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* RSI Highlight */}
          {analysisData.TechnicalIndicators.RSI && (
            <div className={`p-3 rounded-lg ${
              isDark ? 'bg-gray-600/30' : 'bg-white/70'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  RSI Signal
                </span>
                <span className="text-sm">
                  {analysisData.TechnicalIndicators.RSI.Status || ''}
                </span>
              </div>
              <div className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {analysisData.TechnicalIndicators.RSI.CurrentRSI || 'N/A'}
              </div>
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {analysisData.TechnicalIndicators.RSI.Interpretation || ''}
              </div>
            </div>
          )}

          {/* Volume Highlight */}
          {analysisData.TechnicalIndicators.Volume && (
            <div className={`p-3 rounded-lg ${
              isDark ? 'bg-gray-600/30' : 'bg-white/70'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Volume Activity
                </span>
                <span className="text-sm">
                  {analysisData.TechnicalIndicators.Volume.Status || ''}
                </span>
              </div>
              <div className={`text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {analysisData.TechnicalIndicators.Volume.CurrentVolume ?
                  `${parseFloat(analysisData.TechnicalIndicators.Volume.CurrentVolume).toLocaleString()} USDT` :
                  'N/A'
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
