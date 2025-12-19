/**
 * Local Backend API Configuration
 * Configuration for the local backend API that handles dashboard, users, content management, etc.
 */

// Get API base URL from environment variable or use default
const LOCAL_BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Log the API base URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('[Local Backend Config] Base URL:', LOCAL_BACKEND_BASE_URL);
  console.log('[Local Backend Config] Environment variable:', process.env.REACT_APP_BACKEND_URL || 'not set (using default)');
}

/**
 * Local Backend API Endpoints
 * Endpoints handled by the local backend (not in admin-service)
 */
export const LOCAL_BACKEND_ENDPOINTS = {
  // User endpoints - REMOVED: Not in OpenAPI spec
  // Dashboard endpoints - REMOVED: Not in OpenAPI spec
  // These endpoints are no longer available

  // Note: Most endpoints have been moved to admin-service
  // Only endpoints that truly need local backend processing should remain here
};

/**
 * Local Backend API Configuration object
 */
export const LOCAL_BACKEND_CONFIG = {
  baseURL: LOCAL_BACKEND_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export default LOCAL_BACKEND_CONFIG;

