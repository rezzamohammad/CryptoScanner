/**
 * AI Response Validation Service
 * Extracted from AIStrategyModal.tsx for better separation of concerns
 *
 * This service provides comprehensive validation for AI analysis responses
 * including field validation, content sanitization, and error handling.
 */

// Validation Result Types
export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  invalidFields: string[];
  errors: string[];
}

export interface FieldValidationResult {
  field: string;
  isValid: boolean;
  value: any;
  error?: string;
}

/**
 * AI Response Validation Service
 * Handles validation of AI analysis responses with comprehensive error checking
 */
export class AIResponseValidator {
  private static readonly REQUIRED_FIELDS = [
    'reason', 'strategy'  // Only require the core fields that the backend API actually provides
  ];

  private static readonly ENHANCED_FIELDS = [
    'keySupport', 'keyResistance', 'priceAnalysis',
    'macd', 'macdStatus', 'movingAverages', 'volume', 'volumeStatus',
    'BullishScenario', 'BearishScenario', 'ConfidenceScore'
  ];

  private static readonly MIN_CONTENT_LENGTH = {
    reason: 10,    // Very lenient to avoid false failures
    strategy: 15,  // Very lenient to avoid false failures
    warning: 5,
    bbands: 3,
    priceAnalysis: 10,
    BullishScenario: 10,
    BearishScenario: 10
  };

  private static readonly NUMERIC_RANGES = {
    rsi: { min: 0, max: 100 },
    price: { min: 0, max: Infinity },
    confidence: { min: 0, max: 100 }
  };

  /**
   * Validates an AI response for completeness and correctness
   * @param data - The AI response data to validate
   * @returns ValidationResult with validation status and errors
   */
  static validateResponse(data: any): ValidationResult {
    const missingFields: string[] = [];
    const invalidFields: string[] = [];
    const errors: string[] = [];

    // Check required fields
    this.REQUIRED_FIELDS.forEach(field => {
      const value = this.extractFieldValue(data, field);
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        missingFields.push(field);
      } else if (!this.validateFieldContent(field, value)) {
        invalidFields.push(field);
        errors.push(`Invalid ${field}: ${this.getFieldValidationError(field, value)}`);
      }
    });

    return {
      isValid: missingFields.length === 0 && invalidFields.length === 0,
      missingFields,
      invalidFields,
      errors
    };
  }

  /**
   * Validates the content of a specific field
   * @param field - The field name to validate
   * @param value - The value to validate
   * @returns boolean indicating if the field content is valid
   */
  static validateFieldContent(field: string, value: any): boolean {
    if (!value) return false;

    const stringValue = String(value).trim();

    // Check minimum length requirements
    if (this.MIN_CONTENT_LENGTH[field as keyof typeof this.MIN_CONTENT_LENGTH]) {
      const minLength = this.MIN_CONTENT_LENGTH[field as keyof typeof this.MIN_CONTENT_LENGTH];
      if (stringValue.length < minLength) return false;
    }

    // Validate RSI range
    if (field === 'rsi') {
      const numValue = parseFloat(stringValue);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) return false;
    }

    // Validate price fields
    if (['currentPrice', 'recentHigh', 'recentLow'].includes(field)) {
      const priceMatch = stringValue.match(/[\d.,]+/);
      if (!priceMatch) return false;
      const numValue = parseFloat(priceMatch[0].replace(/,/g, ''));
      if (isNaN(numValue) || numValue <= 0) return false;
    }

    return true;
  }

  /**
   * Extracts field values from AI response data with fallback handling
   * @param data - The AI response data
   * @param field - The field name to extract
   * @returns The extracted field value or 'N/A' if not found
   */
  static extractFieldValue(data: any, field: string): any {
    // Handle backend API response format
    switch (field) {
      case 'reason':
        return data.Reason || data.reason;
      case 'strategy':
        return data.SuggestedStrategy || data.strategy;
      case 'currentPrice':
        return data.PriceAction?.CurrentPrice || data.currentPrice || 'N/A';
      case 'recentHigh':
        return data.PriceAction?.RecentHigh || data.recentHigh || 'N/A';
      case 'recentLow':
        return data.PriceAction?.RecentLow || data.recentLow || 'N/A';
      case 'rsi':
        return data.TechnicalIndicators?.RSI?.CurrentRSI || data.rsi || 'N/A';
      case 'bbands':
        return data.TechnicalIndicators?.BollingerBands?.PricePosition || data.bbands || 'N/A';
      case 'warning':
        return data.RiskWarning || data.warning || 'N/A';
      default:
        return data[field] || 'N/A';
    }
  }

  /**
   * Gets a detailed validation error message for a specific field
   * @param field - The field name that failed validation
   * @param value - The invalid value
   * @returns A descriptive error message
   */
  private static getFieldValidationError(field: string, value: any): string {
    const stringValue = String(value).trim();

    if (this.MIN_CONTENT_LENGTH[field as keyof typeof this.MIN_CONTENT_LENGTH]) {
      const minLength = this.MIN_CONTENT_LENGTH[field as keyof typeof this.MIN_CONTENT_LENGTH];
      if (stringValue.length < minLength) {
        return `Content too short (${stringValue.length}/${minLength} characters)`;
      }
    }

    if (field === 'rsi') {
      const numValue = parseFloat(stringValue);
      if (isNaN(numValue)) return 'Not a valid number';
      if (numValue < 0 || numValue > 100) return 'Must be between 0-100';
    }

    return 'Invalid format or content';
  }

  /**
   * Sanitizes content by removing potentially harmful characters and normalizing whitespace
   * @param content - The content to sanitize
   * @param maxLength - Optional maximum length limit
   * @returns Sanitized content string
   */
  static sanitizeContent(content: string, maxLength?: number): string {
    if (!content) return '';

    const sanitized = content
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?%-*$:\n•]/g, ''); // Remove potentially harmful characters but keep formatting chars

    // Apply specific length limit if provided, otherwise use default
    const limit = maxLength || 1000;
    return sanitized.substring(0, limit);
  }

  /**
   * Validates multiple fields at once and returns detailed results
   * @param data - The AI response data to validate
   * @param fields - Array of field names to validate
   * @returns Array of FieldValidationResult objects
   */
  static validateFields(data: any, fields: string[]): FieldValidationResult[] {
    return fields.map(field => {
      const value = this.extractFieldValue(data, field);
      const isValid = this.validateFieldContent(field, value);

      return {
        field,
        isValid,
        value,
        error: isValid ? undefined : this.getFieldValidationError(field, value)
      };
    });
  }

  /**
   * Checks if the AI response has useful data for display
   * @param data - The AI response data
   * @returns boolean indicating if the response contains useful information
   */
  static hasUsefulData(data: any): boolean {
    return !!(
      data.Reason ||
      data.SuggestedStrategy ||
      data.TechnicalIndicators ||
      data.PriceAction
    );
  }

  /**
   * Gets validation configuration for testing and debugging
   * @returns Object containing validation configuration
   */
  static getValidationConfig() {
    return {
      requiredFields: [...this.REQUIRED_FIELDS],
      enhancedFields: [...this.ENHANCED_FIELDS],
      minContentLength: { ...this.MIN_CONTENT_LENGTH },
      numericRanges: { ...this.NUMERIC_RANGES }
    };
  }
}