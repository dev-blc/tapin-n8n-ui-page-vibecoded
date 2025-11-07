/**
 * API Helper Utilities
 * Centralized error handling, formatting, and utility functions for API calls
 */

/**
 * Checks if an error is an API error
 * @param {any} error - Error to check
 * @returns {boolean}
 */
export const isApiError = (error) => {
  return error && (error.response || error.status || error.isNetworkError);
};

/**
 * Extracts a user-friendly error message from an error object
 * @param {any} error - Error object
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';

  // Network error
  if (error.isNetworkError || error.message === 'Network Error') {
    // Check if it's a specific backend error message
    if (error.message && error.message.includes('Local backend is not available')) {
      return error.message;
    }
    if (error.message && error.message.includes('admin-service availability')) {
      return error.message;
    }
    return 'Network error. Please check your connection and try again.';
  }

  // API response error
  if (error.response?.data) {
    const data = error.response.data;
    
    // Check for message in various possible locations
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (typeof data === 'string') return data;
    
    // Check for validation errors
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.join(', ');
    }
    
    if (data.errors && typeof data.errors === 'object') {
      const errorMessages = Object.values(data.errors).flat();
      return errorMessages.join(', ');
    }
  }

  // Error with message property
  if (error.message) {
    // If the error message contains "Cannot GET" or similar, it's likely a server error
    // Try to extract a more user-friendly message
    if (error.message.includes('Cannot GET') || error.message.includes('Cannot POST') || error.message.includes('Cannot PUT') || error.message.includes('Cannot DELETE')) {
      return 'API endpoint not found. Please check the API configuration.';
    }
    // If it's a network/CORS error
    if (error.message.includes('Network Error') || error.message.includes('CORS')) {
      return 'Unable to connect to the API server. Please check your network connection and API configuration.';
    }
    return error.message;
  }

  // Status code based messages
  if (error.status) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. The resource may already exist.';
      case 422:
        return 'Validation error. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return `Error ${error.status}: ${error.statusText || 'An error occurred'}`;
    }
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Formats an API error for display
 * @param {any} error - Error object
 * @returns {{ message: string; status?: number; code?: string }}
 */
export const formatApiError = (error) => {
  return {
    message: getErrorMessage(error),
    status: error.status || error.response?.status,
    code: error.code || error.response?.data?.code,
  };
};

/**
 * Handles an API error and optionally shows a toast notification
 * @param {any} error - Error object
 * @param {Function} [showToast] - Optional toast function
 * @returns {string} Error message
 */
export const handleApiError = (error, showToast = null) => {
  const errorMessage = getErrorMessage(error);
  
  if (showToast && typeof showToast === 'function') {
    showToast(errorMessage, { type: 'error' });
  }
  
  console.error('[API Error]', error);
  return errorMessage;
};

/**
 * Retries a failed request
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries (default: 3)
 * @param {number} delay - Delay between retries in ms (default: 1000)
 * @returns {Promise<any>}
 */
export const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && (error.isNetworkError || error.status >= 500)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay);
    }
    throw error;
  }
};

/**
 * Checks if an error is retryable
 * @param {any} error - Error to check
 * @returns {boolean}
 */
export const isRetryableError = (error) => {
  if (error.isNetworkError) return true;
  if (error.status >= 500) return true;
  if (error.status === 408) return true; // Request timeout
  return false;
};

export default {};

