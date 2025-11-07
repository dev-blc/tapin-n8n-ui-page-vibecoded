/**
 * Admin Service API Configuration
 * Configuration for the external admin-service microservice
 * This service handles: onboarding questions/options, plot-twists (basic CRUD), health
 */

// Get API base URL from environment variable or use default
const ADMIN_SERVICE_BASE_URL = process.env.REACT_APP_ADMIN_SERVICE_URL || 'https://admin-service-production-9d00.up.railway.app';

// Log the API base URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('[Admin Service Config] Base URL:', ADMIN_SERVICE_BASE_URL);
  console.log('[Admin Service Config] Environment variable:', process.env.REACT_APP_ADMIN_SERVICE_URL || 'not set (using default)');
}

/**
 * Admin Service API Endpoints
 * Only endpoints that are actually provided by the admin-service
 */
export const ADMIN_SERVICE_ENDPOINTS = {
  // Onboarding endpoints
  ONBOARDING_QUESTIONS: '/admin/onboarding/questions',
  ONBOARDING_QUESTION_BY_ID: (id) => `/admin/onboarding/questions/${id}`,
  ONBOARDING_OPTIONS: '/admin/onboarding/options',
  ONBOARDING_OPTION_BY_ID: (id) => `/admin/onboarding/options/${id}`,

  // Plot Twist endpoints (basic CRUD only)
  PLOT_TWIST_QUESTS: '/admin/plot-twists',
  PLOT_TWIST_QUEST_BY_ID: (id) => `/admin/plot-twists/${id}`,

  // Health check
  HEALTH: '/health',
};

/**
 * Admin Service API Configuration object
 */
export const ADMIN_SERVICE_CONFIG = {
  baseURL: ADMIN_SERVICE_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export default ADMIN_SERVICE_CONFIG;

