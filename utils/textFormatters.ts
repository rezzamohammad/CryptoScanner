/**
 * Text Formatting Utilities
 * Extracted from AIStrategyModal.tsx for better reusability
 *
 * This module provides comprehensive text formatting utilities for AI analysis content
 * including truncation, enhancement, and structured formatting.
 */

export interface FormattedTextResult {
  formatted: string;
  isTruncated: boolean;
  fullText: string;
}

export interface TextEnhancementOptions {
  maxLength?: number;
  includeRSI?: boolean;
  includeLevels?: boolean;
  includeScenarios?: boolean;
}

/**
 * Enhanced text formatting utility with STRICT character limits
 * @param text - The text to format
 * @param maxLength - Maximum length for the formatted text (default: 300)
 * @returns FormattedTextResult with formatted text and metadata
 */
export const formatLongText = (text: string, maxLength: number = 300): FormattedTextResult => {
  if (!text) return { formatted: 'N/A', isTruncated: false, fullText: '' };

  // Enhanced text processing for better information density and readability
  const cleanText = text
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    // Format technical indicators with consistent styling
    .replace(/RSI[:\s]*(\d+\.?\d*)/gi, '**RSI:** $1')
    .replace(/MACD[:\s]*([^\s,]+)/gi, '**MACD:** $1')
    .replace(/Volume[:\s]*([^\s,]+)/gi, '**Volume:** $1')
    .replace(/Support[:\s]*\$?(\d+\.?\d*)/gi, '**Support:** $$$1')
    .replace(/Resistance[:\s]*\$?(\d+\.?\d*)/gi, '**Resistance:** $$$1')
    // Add structure with bullet points for key information
    .replace(/\b(IF|THEN|WHEN|TARGET|STOP)\b/gi, '\n• **$1**')
    // Improve paragraph breaks for better readability
    .replace(/([.!?])\s*([A-Z][a-z])/g, '$1\n\n$2')
    .replace(/([.!?])\s*([•])/g, '$1\n$2')
    .replace(/\n{3,}/g, '\n\n') // Limit to double line breaks
    .replace(/^\n+|\n+$/g, ''); // Remove leading/trailing newlines

  const isTruncated = cleanText.length > maxLength;

  // STRICT truncation - prioritize staying under limit
  let formatted = cleanText;
  if (isTruncated) {
    // More aggressive truncation to ensure we stay under limit
    const targetLength = maxLength - 3; // Reserve 3 chars for '...'
    const truncated = cleanText.substring(0, targetLength);

    // Try to break at bullet point boundary first (but be more aggressive)
    const lastBulletPoint = truncated.lastIndexOf('\n•');
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    );

    if (lastBulletPoint > targetLength * 0.5) {
      // Keep complete bullet points if found in last 50% (more aggressive)
      formatted = cleanText.substring(0, lastBulletPoint) + '...';
    } else if (lastSentenceEnd > targetLength * 0.6) {
      // Otherwise break at sentence boundary in last 40% (more aggressive)
      formatted = cleanText.substring(0, lastSentenceEnd + 1) + '...';
    } else {
      // Fall back to word boundary
      const lastSpace = truncated.lastIndexOf(' ');
      formatted = cleanText.substring(0, lastSpace > 0 ? lastSpace : targetLength) + '...';
    }

    // Final safety check - ensure we never exceed maxLength
    if (formatted.length > maxLength) {
      formatted = cleanText.substring(0, maxLength - 3) + '...';
    }
  }

  return {
    formatted,
    isTruncated,
    fullText: cleanText
  };
};

/**
 * Enhanced content enrichment for more informative analysis - CONSERVATIVE VERSION
 * @param originalText - The original text to enrich
 * @param analysisData - The analysis data to extract additional information from
 * @param maxLength - Maximum length for the enriched content (default: 300)
 * @returns Enriched text content
 */
export const enrichAnalysisContent = (
  originalText: string,
  analysisData: any,
  maxLength: number = 300
): string => {
  if (!originalText || originalText === 'N/A') return originalText;

  // Start with original text and track length
  let enrichedText = originalText;
  const originalLength = originalText.length;

  // Only add enhancements if we have room (leave 50 chars buffer for truncation logic)
  const availableSpace = maxLength - originalLength - 50;

  if (availableSpace <= 0) {
    // Original text is already too long, return as-is
    return enrichedText;
  }

  // Add only the most critical technical values if space allows
  const rsi = analysisData.TechnicalIndicators?.RSI?.CurrentRSI;
  const support = analysisData.PriceAction?.KeySupport;
  const resistance = analysisData.PriceAction?.KeyResistance;

  // Prioritize RSI if not already mentioned and we have space
  if (rsi && !enrichedText.includes('RSI') && availableSpace > 30) {
    const rsiValue = parseFloat(rsi);
    const rsiCondition = rsiValue > 70 ? 'overbought' : rsiValue < 30 ? 'oversold' : 'neutral';
    const rsiAddition = ` **RSI:** ${rsi} (${rsiCondition}).`;

    if (enrichedText.length + rsiAddition.length <= maxLength - 20) {
      enrichedText = `${rsiAddition} ${enrichedText}`;
    }
  }

  // Add key levels only if we still have significant space
  if (support && resistance && (enrichedText.length + 60) <= maxLength - 20) {
    enrichedText += `\n• **Levels:** $${support} - $${resistance}`;
  }

  return enrichedText;
};

/**
 * Enhanced strategy content with actionable trading scenarios - CONSERVATIVE VERSION
 * @param originalText - The original strategy text to enrich
 * @param analysisData - The analysis data to extract additional information from
 * @param maxLength - Maximum length for the enriched content (default: 250)
 * @returns Enriched strategy content
 */
export const enrichStrategyContent = (
  originalText: string,
  analysisData: any,
  maxLength: number = 250
): string => {
  if (!originalText || originalText === 'N/A') return originalText;

  // Start with original text and track length
  let enrichedText = originalText;
  const originalLength = originalText.length;

  // Only add enhancements if we have room (leave 50 chars buffer for truncation logic)
  const availableSpace = maxLength - originalLength - 50;

  if (availableSpace <= 0) {
    // Original text is already too long, return as-is
    return enrichedText;
  }

  // Add only concise trading scenarios if space allows
  const rsi = analysisData.TechnicalIndicators?.RSI?.CurrentRSI;
  const support = analysisData.PriceAction?.KeySupport;
  const resistance = analysisData.PriceAction?.KeyResistance;

  if (rsi && support && resistance && availableSpace > 80) {
    const rsiValue = parseFloat(rsi);
    let scenarioText = '';

    if (rsiValue > 70) {
      scenarioText = `\n• **IF** below $${support}: Short target`;
    } else if (rsiValue < 30) {
      scenarioText = `\n• **IF** above $${resistance}: Long target`;
    } else {
      scenarioText = `\n• **Range:** $${support} - $${resistance}`;
    }

    if (enrichedText.length + scenarioText.length <= maxLength - 20) {
      enrichedText += scenarioText;
    }
  }

  return enrichedText;
};

/**
 * Formats technical indicators for display
 * @param indicators - The technical indicators object
 * @returns Formatted string of technical indicators
 */
export const formatTechnicalIndicators = (indicators: any): string => {
  if (!indicators) return 'N/A';

  const parts: string[] = [];

  // RSI
  if (indicators.RSI?.CurrentRSI) {
    const rsi = parseFloat(indicators.RSI.CurrentRSI);
    const condition = rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral';
    parts.push(`**RSI:** ${rsi.toFixed(1)} (${condition})`);
  }

  // MACD
  if (indicators.MACD?.Status) {
    parts.push(`**MACD:** ${indicators.MACD.Status}`);
  }

  // Bollinger Bands
  if (indicators.BollingerBands?.PricePosition) {
    parts.push(`**BB:** ${indicators.BollingerBands.PricePosition}`);
  }

  return parts.length > 0 ? parts.join(' • ') : 'N/A';
};

/**
 * Formats price action data for display
 * @param priceAction - The price action object
 * @returns Formatted string of price action data
 */
export const formatPriceAction = (priceAction: any): string => {
  if (!priceAction) return 'N/A';

  const parts: string[] = [];

  if (priceAction.CurrentPrice) {
    parts.push(`**Current:** ${priceAction.CurrentPrice}`);
  }

  if (priceAction.KeySupport && priceAction.KeyResistance) {
    parts.push(`**Range:** $${priceAction.KeySupport} - $${priceAction.KeyResistance}`);
  }

  return parts.length > 0 ? parts.join(' • ') : 'N/A';
};

/**
 * Truncates text at word boundaries to avoid breaking words
 * @param text - The text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateAtWordBoundary = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0
    ? text.substring(0, lastSpace) + '...'
    : truncated + '...';
};

/**
 * Removes markdown formatting from text
 * @param text - The text with markdown formatting
 * @returns Plain text without markdown
 */
export const stripMarkdown = (text: string): string => {
  if (!text) return '';

  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1')     // Remove italic
    .replace(/^• /gm, '')            // Remove bullet points
    .replace(/\n+/g, ' ')            // Replace newlines with spaces
    .trim();
};

/**
 * Capitalizes the first letter of each sentence
 * @param text - The text to capitalize
 * @returns Text with capitalized sentences
 */
export const capitalizeSentences = (text: string): string => {
  if (!text) return '';

  return text.replace(/(^|[.!?]\s+)([a-z])/g, (match, prefix, letter) => {
    return prefix + letter.toUpperCase();
  });
};