/**
 * Admin Service API Configuration
 * Configuration for the external admin-service microservice
 * This service handles: onboarding questions/options, plot-twists (basic CRUD), health
 */

// Get API base URL from environment variable or use default
const ADMIN_SERVICE_BASE_URL = process.env.REACT_APP_ADMIN_SERVICE_URL || 'https://admin-service-production-9d00.up.railway.app';
const ANALYTICS_SERVICE_BASE_URL = 'https://analytics-pt-development.up.railway.app';

// Log the API base URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('[Admin Service Config] Base URL:', ADMIN_SERVICE_BASE_URL);
  console.log('[Admin Service Config] Environment variable:', process.env.REACT_APP_ADMIN_SERVICE_URL || 'not set (using default)');
}

/**
 * Admin Service API Endpoints
 * All endpoints provided by the admin-service microservice
 */
export const ADMIN_SERVICE_ENDPOINTS = {
  // Onboarding endpoints
  ONBOARDING_QUESTIONS: '/admin/onboarding/questions',
  ONBOARDING_QUESTION_BY_ID: (id) => `/admin/onboarding/questions/${id}`,
  ONBOARDING_OPTIONS: '/admin/onboarding/options',
  ONBOARDING_OPTION_BY_ID: (id) => `/admin/onboarding/options/${id}`,

  // Plot Twist endpoints
  PLOT_TWIST_QUESTS: '/admin/plot-twists',
  PLOT_TWIST_QUEST_BY_ID: (id) => `/admin/plot-twists/${id}`,
  PLOT_TWIST_OPTION_BY_ID: (id) => `/admin/plot-twist-options/${id}`,
  PLOT_TWIST_RESPONSE_BY_ID: (id) => `/admin/plot-twist-responses/${id}`,

  // Character endpoints
  CHARACTERS: '/admin/characters',
  CHARACTER_BY_ID: (id) => `/admin/characters/${id}`,

  // Quick Shift Loop endpoints
  QUICK_SHIFT_CREATE_LOOP: '/admin/quick-shift/create-loop',
  QUICK_SHIFT_GET_ALL_LOOPS: '/admin/quick-shift/get-all',
  QUICK_SHIFT_LOOP_BY_ID: (id) => `/admin/quick-shift/get/${id}`,
  QUICK_SHIFT_UPDATE_LOOP: (id) => `/admin/quick-shift/update-loop/${id}`,
  QUICK_SHIFT_DELETE_LOOP: (id) => `/admin/quick-shift/delete-loop/${id}`,

  // Quick Shift Sensation Prompt endpoints
  QUICK_SHIFT_CREATE_SENSATION: '/admin/quick-shift/create-sensation-prompt',
  QUICK_SHIFT_GET_ALL_SENSATIONS: '/admin/quick-shift/get-all-sensation-prompts',
  QUICK_SHIFT_UPDATE_SENSATION: (id) => `/admin/quick-shift/update-sensation-prompt/${id}`,
  QUICK_SHIFT_DELETE_SENSATION: (id) => `/admin/quick-shift/delete-sensation-prompt/${id}`,

  // Meditation Template endpoints
  MEDITATION_TEMPLATES: '/admin/meditation-templates',
  MEDITATION_TEMPLATE_BY_ID: (id) => `/admin/meditation-templates/${id}`,

  // Affirmation Template endpoints
  AFFIRMATION_TEMPLATES: '/admin/affirmation-templates',
  AFFIRMATION_TEMPLATE_BY_ID: (id) => `/admin/affirmation-templates/${id}`,

  // User Affirmations endpoints (admin access)
  USER_AFFIRMATIONS: '/admin/user-affirmations',
  USER_AFFIRMATION_BY_ID: (id) => `/admin/user-affirmations/${id}`,

  // User Meditations endpoints (admin access)
  USER_MEDITATIONS: '/admin/user-meditations',
  USER_MEDITATION_BY_ID: (id) => `/admin/user-meditations/${id}`,

  // My Affirmations endpoints (user-scoped)
  MY_AFFIRMATIONS: '/admin/my-affirmations',
  MY_AFFIRMATION_BY_ID: (id) => `/admin/my-affirmations/${id}`,

  // My Meditations endpoints (user-scoped)
  MY_MEDITATIONS: '/admin/my-meditations',
  MY_MEDITATION_BY_ID: (id) => `/admin/my-meditations/${id}`,

  // Health check
  HEALTH: '/health',

  // Analytics endpoints
  ANALYTICS_OVERVIEW: '/api/analytics/overview',
};

export const ANALYTICS_SERVICE_CONFIG = {
  baseURL: ANALYTICS_SERVICE_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
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

