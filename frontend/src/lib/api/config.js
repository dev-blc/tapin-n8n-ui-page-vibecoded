/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Get API base URL from environment variable or use default
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-service-production-9d00.up.railway.app';

// Log the API base URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('[API Config] Base URL:', API_BASE_URL);
  console.log('[API Config] Environment variable:', process.env.REACT_APP_API_BASE_URL || 'not set (using default)');
}

/**
 * API Endpoints
 * All API endpoint paths are defined here
 */
export const API_ENDPOINTS = {
  // User endpoints
  USERS: '/admin/users',
  USER_BY_ID: (id) => `/admin/users/${id}`,
  USER_ENGAGEMENT: (id) => `/admin/users/${id}/engagement`,
  USER_ACTIVITY: (id) => `/admin/users/${id}/activity`,

  // Onboarding endpoints
  ONBOARDING_QUESTIONS: '/admin/onboarding/questions',
  ONBOARDING_QUESTION_BY_ID: (id) => `/admin/onboarding/questions/${id}`,
  ONBOARDING_OPTIONS: '/admin/onboarding/options',
  ONBOARDING_OPTION_BY_ID: (id) => `/admin/onboarding/options/${id}`,
  CHARACTER_MAPPING: '/admin/onboarding/characters',

  // Dashboard endpoints
  DASHBOARD_STATS: '/admin/dashboard/stats',
  DASHBOARD_ACTIVITY: '/admin/dashboard/activity',
  DASHBOARD_CONTENT_HEALTH: '/admin/dashboard/content-health',

  // Quick Shift endpoints
  QUICK_SHIFT_LOOPS: '/admin/quick-shifts/loops',
  QUICK_SHIFT_LOOP_BY_ID: (id) => `/admin/quick-shifts/loops/${id}`,
  QUICK_SHIFT_REFRAMES: '/admin/quick-shifts/reframes',
  QUICK_SHIFT_REFRAME_BY_ID: (id) => `/admin/quick-shifts/reframes/${id}`,
  QUICK_SHIFT_PROTECTORS: '/admin/quick-shifts/protectors',
  QUICK_SHIFT_PROTECTOR_BY_ID: (id) => `/admin/quick-shifts/protectors/${id}`,

  // Plot Twist endpoints
  PLOT_TWIST_QUESTS: '/admin/plot-twists/quests',
  PLOT_TWIST_QUEST_BY_ID: (id) => `/admin/plot-twists/quests/${id}`,
  PLOT_TWIST_CHARACTERS: '/admin/plot-twists/characters',
  PLOT_TWIST_RESPONSE_OPTIONS: '/admin/plot-twists/response-options',

  // Template endpoints
  AFFIRMATION_TEMPLATES: '/admin/templates/affirmations',
  AFFIRMATION_TEMPLATE_BY_ID: (id) => `/admin/templates/affirmations/${id}`,
  MEDITATION_TEMPLATES: '/admin/templates/meditations',
  MEDITATION_TEMPLATE_BY_ID: (id) => `/admin/templates/meditations/${id}`,
};

/**
 * API Configuration object
 */
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export default API_CONFIG;

