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
  // User endpoints
  USERS: '/api/admin/users',
  USER_BY_ID: (id) => `/api/admin/users/${id}`,
  USER_ENGAGEMENT: (id) => `/api/admin/users/${id}/engagement`,
  USER_ACTIVITY: (id) => `/api/admin/users/${id}/activity`,

  // Dashboard endpoints
  DASHBOARD_STATS: '/api/admin/dashboard/stats',
  DASHBOARD_ACTIVITY: '/api/admin/dashboard/activity',
  DASHBOARD_CONTENT_HEALTH: '/api/admin/dashboard/content-health',

  // Quick Shift endpoints
  QUICK_SHIFT_LOOPS: '/api/admin/quick-shifts/loops',
  QUICK_SHIFT_LOOP_BY_ID: (id) => `/api/admin/quick-shifts/loops/${id}`,
  QUICK_SHIFT_REFRAMES: '/api/admin/quick-shifts/reframes',
  QUICK_SHIFT_REFRAME_BY_ID: (id) => `/api/admin/quick-shifts/reframes/${id}`,
  QUICK_SHIFT_PROTECTORS: '/api/admin/quick-shifts/protectors',
  QUICK_SHIFT_PROTECTOR_BY_ID: (id) => `/api/admin/quick-shifts/protectors/${id}`,

  // Plot Twist extended endpoints (not in admin-service)
  PLOT_TWIST_CHARACTERS: '/api/admin/plot-twists/characters',
  PLOT_TWIST_RESPONSE_OPTIONS: '/api/admin/plot-twists/response-options',

  // Template endpoints
  AFFIRMATION_TEMPLATES: '/api/admin/templates/affirmations',
  AFFIRMATION_TEMPLATE_BY_ID: (id) => `/api/admin/templates/affirmations/${id}`,
  MEDITATION_TEMPLATES: '/api/admin/templates/meditations',
  MEDITATION_TEMPLATE_BY_ID: (id) => `/api/admin/templates/meditations/${id}`,

  // Character mapping (for onboarding)
  CHARACTER_MAPPING: '/api/admin/onboarding/characters',
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

