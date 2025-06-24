/**
 * Error Handling Utilities
 * Provides consistent error handling and user-friendly messages
 */

/**
 * API Error types
 */
export type ApiErrorType = 
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR' 
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT_ERROR'
  | 'PARSE_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * API Error class
 */
export class ApiError extends Error {
  public type: ApiErrorType;
  public statusCode?: number;
  public originalError?: any;

  constructor(message: string, type: ApiErrorType, statusCode?: number, originalError?: any) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Handle and categorize API errors
 */
export function handleApiError(error: any): ApiError {
  // Network/fetch errors
  if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
    return new ApiError(
      'Network connection failed. Please check your internet connection.',
      'NETWORK_ERROR',
      undefined,
      error
    );
  }

  // Timeout errors
  if (error.message?.includes('timeout') || error.name === 'AbortError') {
    return new ApiError(
      'Request timed out. The server is taking too long to respond.',
      'TIMEOUT_ERROR',
      undefined,
      error
    );
  }

  // HTTP status errors
  if (error.message?.includes('503')) {
    return new ApiError(
      'Market data service is temporarily unavailable. Please try again in a few moments.',
      'SERVICE_UNAVAILABLE',
      503,
      error
    );
  }

  if (error.message?.includes('500')) {
    return new ApiError(
      'Internal server error. Our team has been notified.',
      'SERVER_ERROR',
      500,
      error
    );
  }

  if (error.message?.includes('404')) {
    return new ApiError(
      'The requested data was not found.',
      'SERVER_ERROR',
      404,
      error
    );
  }

  if (error.message?.includes('401') || error.message?.includes('403')) {
    return new ApiError(
      'Authentication failed. Please check your API credentials.',
      'SERVER_ERROR',
      401,
      error
    );
  }

  // JSON parsing errors
  if (error.message?.includes('JSON') || error.name === 'SyntaxError') {
    return new ApiError(
      'Invalid response format from server.',
      'PARSE_ERROR',
      undefined,
      error
    );
  }

  // WebSocket errors
  if (error.message?.includes('WebSocket')) {
    return new ApiError(
      'Real-time connection failed. Retrying...',
      'NETWORK_ERROR',
      undefined,
      error
    );
  }

  // Default unknown error
  return new ApiError(
    error.message || 'An unexpected error occurred. Please try again.',
    'UNKNOWN_ERROR',
    undefined,
    error
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: ApiError): string {
  switch (error.type) {
    case 'NETWORK_ERROR':
      return 'Connection problem. Please check your internet and try again.';
    
    case 'SERVICE_UNAVAILABLE':
      return 'Service temporarily unavailable. We\'ll retry automatically.';
    
    case 'SERVER_ERROR':
      return 'Server error. Our team has been notified.';
    
    case 'TIMEOUT_ERROR':
      return 'Request timed out. Please try again.';
    
    case 'PARSE_ERROR':
      return 'Data format error. Please refresh the page.';
    
    default:
      return 'Something went wrong. Please try again.';
  }
}

/**
 * Determine if error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  return [
    'NETWORK_ERROR',
    'SERVICE_UNAVAILABLE', 
    'TIMEOUT_ERROR'
  ].includes(error.type);
}

/**
 * Get retry delay based on attempt number
 */
export function getRetryDelay(attemptNumber: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, attemptNumber - 1), 16000);
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  onRetry?: (attempt: number, error: ApiError) => void
): Promise<T> {
  let lastError: ApiError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = handleApiError(error);
      
      // Don't retry if error is not retryable or this is the last attempt
      if (!isRetryableError(lastError) || attempt === maxAttempts) {
        throw lastError;
      }

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Wait before retrying
      const delay = getRetryDelay(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Log error for debugging
 */
export function logError(error: ApiError, context?: string): void {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const debugEnabled = process.env.NEXT_PUBLIC_DEBUG_API === 'true';

  if (isDevelopment || debugEnabled) {
    console.group(`🚨 API Error${context ? ` (${context})` : ''}`);
    console.error('Type:', error.type);
    console.error('Message:', error.message);
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
    if (error.originalError) {
      console.error('Original Error:', error.originalError);
    }
    console.groupEnd();
  }
}

/**
 * Create error toast message
 */
export function createErrorToast(error: ApiError): {
  title: string;
  message: string;
  type: 'error' | 'warning';
} {
  const isWarning = error.type === 'SERVICE_UNAVAILABLE' || error.type === 'TIMEOUT_ERROR';
  
  return {
    title: isWarning ? 'Connection Issue' : 'Error',
    message: getUserFriendlyErrorMessage(error),
    type: isWarning ? 'warning' : 'error'
  };
}
