/**
 * ScenarioAnalysisSection Component
 * 
 * Displays bullish and bearish trading scenarios with expandable content
 * and if-then logic for different market conditions
 */

'use client';

import { AIResponseValidator } from '../../services/aiValidationService';
import { formatLongText as formatText } from '../../utils/textFormatters';
import { AnalysisDataWithQuality } from '../../types/ai';

interface ScenarioAnalysisSectionProps {
  analysisData: AnalysisDataWithQuality;
  isDark: boolean;
  expandedSections: {[key: string]: boolean};
  onToggleExpansion: (sectionKey: string) => void;
}

export function ScenarioAnalysisSection({ 
  analysisData, 
  isDark, 
  expandedSections, 
  onToggleExpansion 
}: ScenarioAnalysisSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {/* Bullish Scenario */}
      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'
      }`}>
        <div className={`text-sm font-medium mb-3 flex items-center ${
          isDark ? 'text-green-300' : 'text-green-700'
        }`}>
          <span className="mr-2">📈</span>
          Bullish Scenario
        </div>
        <div className={`text-sm space-y-2 ${
          isDark ? 'text-green-200' : 'text-green-800'
        }`}>
          {analysisData.ScenarioAnalysis?.BullishScenario ? (
            (() => {
              const { formatted, isTruncated, fullText } = formatText(analysisData.ScenarioAnalysis.BullishScenario, 200);
              const isExpanded = expandedSections['bullish'];
              const displayText = isExpanded ? fullText : formatted;

              return (
                <div>
                  <div className="leading-relaxed">
                    {(() => {
                      const sanitizedText = AIResponseValidator.sanitizeContent(displayText, 200);
                      const parts = sanitizedText.split(/(\*\*[^*]+\*\*)/g);

                      return (
                        <div className="whitespace-pre-line">
                          {parts.map((part, index) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              const boldText = part.slice(2, -2);
                              return (
                                <span key={index} className="font-semibold text-green-100 dark:text-green-50">
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
                      onClick={() => onToggleExpansion('bullish')}
                      className={`mt-2 px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                        isDark
                          ? 'bg-green-800/40 text-green-200 hover:bg-green-700/50 border border-green-600/30'
                          : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                      }`}
                    >
                      {isExpanded ? '📖 Less' : '📚 More'}
                    </button>
                  )}
                </div>
              );
            })()
          ) : (
            <>
              <p><strong>IF:</strong> {
                analysisData.TechnicalIndicators?.RSI?.CurrentRSI ?
                  `RSI (${analysisData.TechnicalIndicators.RSI.CurrentRSI}) breaks above 70` :
                  'RSI moves into overbought territory'
              }</p>
              <p><strong>THEN:</strong> {
                analysisData.PriceAction?.KeyResistance ?
                  `Watch for breakout above ${analysisData.PriceAction?.KeyResistance}` :
                  'Monitor for upward price momentum confirmation'
              }</p>
              <p><strong>TARGET:</strong> {
                analysisData.PriceAction?.KeyResistance ?
                  'Next resistance level' :
                  'N/A - Insufficient price level data'
              }</p>
            </>
          )}
        </div>
      </div>

      {/* Bearish Scenario */}
      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'
      }`}>
        <div className={`text-sm font-medium mb-3 flex items-center ${
          isDark ? 'text-red-300' : 'text-red-700'
        }`}>
          <span className="mr-2">📉</span>
          Bearish Scenario
        </div>
        <div className={`text-sm space-y-2 ${
          isDark ? 'text-red-200' : 'text-red-800'
        }`}>
          {analysisData.ScenarioAnalysis?.BearishScenario ? (
            (() => {
              const { formatted, isTruncated, fullText } = formatText(analysisData.ScenarioAnalysis.BearishScenario, 200);
              const isExpanded = expandedSections['bearish'];
              const displayText = isExpanded ? fullText : formatted;

              return (
                <div>
                  <div className="leading-relaxed">
                    {(() => {
                      const sanitizedText = AIResponseValidator.sanitizeContent(displayText, 200);
                      const parts = sanitizedText.split(/(\*\*[^*]+\*\*)/g);

                      return (
                        <div className="whitespace-pre-line">
                          {parts.map((part, index) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              const boldText = part.slice(2, -2);
                              return (
                                <span key={index} className="font-semibold text-red-100 dark:text-red-50">
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
                      onClick={() => onToggleExpansion('bearish')}
                      className={`mt-2 px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                        isDark
                          ? 'bg-red-800/40 text-red-200 hover:bg-red-700/50 border border-red-600/30'
                          : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                      }`}
                    >
                      {isExpanded ? '📖 Less' : '📚 More'}
                    </button>
                  )}
                </div>
              );
            })()
          ) : (
            <>
              <p><strong>IF:</strong> {
                analysisData.TechnicalIndicators?.RSI?.CurrentRSI ?
                  `RSI (${analysisData.TechnicalIndicators.RSI.CurrentRSI}) falls below 30` :
                  'RSI moves into oversold territory'
              }</p>
              <p><strong>THEN:</strong> {
                analysisData.PriceAction?.KeySupport ?
                  `Watch for breakdown below ${analysisData.PriceAction?.KeySupport}` :
                  'Monitor for downward price momentum confirmation'
              }</p>
              <p><strong>TARGET:</strong> {
                analysisData.PriceAction?.KeySupport ?
                  'Next support level' :
                  'N/A - Insufficient price level data'
              }</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
