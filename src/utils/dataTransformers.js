/**
 * Data Transformers
 * Functions to transform API responses to UI-friendly formats
 */

import { formatRelativeTime, formatEngagementScore } from '@/models/utils';

/**
 * Transforms API user response to UI format
 * @param {any} data - Raw API user data
 * @returns {import('@/models').User}
 */
export const transformUserResponse = (data) => {
  return {
    id: data.id || data.userId || '',
    name: data.name || data.fullName || '',
    email: data.email || '',
    phone: data.phone || '',
    tier: data.tier || data.userTier || '1',
    character: data.character || data.characterName || '',
    characterId: data.characterId || data.characterUuid || '',
    currentDay: data.currentDay || data.journeyDay || 0,
    quickShifts: data.quickShifts || data.quickShiftsCompleted || 0,
    plotTwists: data.plotTwists || data.plotTwistsCompleted || 0,
    toolsCreated: data.toolsCreated || data.toolsCount || 0,
    lastActive: data.lastActive ? formatRelativeTime(data.lastActive) : 'Unknown',
    status: data.status || 'Active',
    joinDate: data.joinDate || data.createdAt || '',
    engagementScore: data.engagementScore || data.engagement?.score || 0,
  };
};

/**
 * Transforms API question response to UI format
 * @param {any} data - Raw API question data
 * @returns {import('@/models').OnboardingQuestion}
 */
export const transformQuestionResponse = (data) => {
  return {
    id: data.id || '',
    text: data.text || data.questionText || '',
    displayOrder: data.displayOrder || data.order || 0,
    isActive: data.isActive !== undefined ? data.isActive : true,
    options: (data.options || []).map(transformOptionResponse),
    createdAt: data.createdAt || data.created_at || '',
    updatedAt: data.updatedAt || data.updated_at || '',
  };
};

/**
 * Transforms API option response to UI format
 * @param {any} data - Raw API option data
 * @returns {import('@/models').OnboardingOption}
 */
export const transformOptionResponse = (data) => {
  return {
    id: data.id || '',
    questionId: data.questionId || data.question_id || '',
    optionText: data.optionText || data.text || '',
    displayOrder: data.displayOrder || data.order || 0,
    assignsTier: data.assignsTier || data.tier || '',
    assignsCharacterId: data.assignsCharacterId || data.characterId || data.character_id || '',
    characterName: data.characterName || '',
  };
};

/**
 * Transforms API dashboard stats response to UI format
 * @param {any} data - Raw API stats data
 * @returns {import('@/models').DashboardStats}
 */
export const transformStatsResponse = (data) => {
  return {
    activeUsers: data.activeUsers || data.active_users || 0,
    activeUsersChange: data.activeUsersChange || data.active_users_change || '+0%',
    contentVariations: data.contentVariations || data.content_variations || 0,
    contentVariationsChange: data.contentVariationsChange || data.content_variations_change || '+0%',
    dailyEngagement: data.dailyEngagement || data.daily_engagement || 0,
    dailyEngagementChange: data.dailyEngagementChange || data.daily_engagement_change || 'Steady',
    contentHealth: data.contentHealth || data.content_health || 0,
    contentHealthChange: data.contentHealthChange || data.content_health_change || '',
  };
};

/**
 * Transforms API activity response to UI format
 * @param {any} data - Raw API activity data
 * @returns {import('@/models').RecentActivity}
 */
export const transformActivityResponse = (data) => {
  return {
    id: data.id || '',
    time: data.time || formatRelativeTime(data.timestamp || data.createdAt),
    action: data.action || data.description || '',
    category: data.category || data.type || '',
    actor: data.actor || data.user || 'System',
    type: data.type || 'activity',
  };
};

/**
 * Transforms API content health response to UI format
 * @param {any} data - Raw API content health data
 * @returns {import('@/models').ContentHealth}
 */
export const transformContentHealthResponse = (data) => {
  return {
    name: data.name || '',
    value: data.value || data.health || 0,
    color: data.color || (data.value >= 90 ? 'success' : data.value >= 70 ? 'primary' : 'warning'),
  };
};

/**
 * Formats engagement score for display
 * @param {number} score - Engagement score (0-100)
 * @returns {string}
 */
export const formatEngagementScoreDisplay = (score) => {
  return formatEngagementScore(score).value;
};

/**
 * Normalizes a date string
 * @param {string|Date} date - Date to normalize
 * @returns {string}
 */
export const normalizeDate = (date) => {
  if (!date) return '';
  try {
    return new Date(date).toISOString();
  } catch {
    return '';
  }
};

/**
 * Transforms paginated API response
 * @param {any} response - Raw API paginated response
 * @returns {import('@/models').PaginatedResponse}
 */
export const transformPaginatedResponse = (response) => {
  return {
    data: response.data || response.items || [],
    total: response.total || response.totalCount || 0,
    page: response.page || response.currentPage || 1,
    limit: response.limit || response.pageSize || 10,
    totalPages: response.totalPages || Math.ceil((response.total || 0) / (response.limit || 10)),
  };
};

export default {};

