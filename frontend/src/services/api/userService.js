/**
 * User Service
 * API service for user-related operations
 *
 * This service integrates with Supabase Edge Functions to fetch admin-facing
 * user data for the Admin dashboard.
 */

import supabase from '@/lib/supabaseClient';
import { handleApiError } from '@/utils/apiHelpers';

class UserService {
  /**
   * Get all users with optional filters and pagination
   * Uses Supabase Edge Function: `admin-user-fetch`
   *
   * @param {Object} params - Filter / pagination parameters
   * @param {string} [params.search] - Search term (name, email, id)
   * @param {string} [params.status] - Status filter
   * @param {number} [params.page] - Page number (1-based)
   * @param {number} [params.limit] - Page size
   * @returns {Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }>}
   */
  async getUsers(params = {}) {
    const {
      search,
      status,
      page = 1,
      limit = 50,
    } = params;

    try {
      // Call Supabase Edge Function with filters in the body
      const { data, error } = await supabase.functions.invoke('admin-user-fetch', {
        body: {
          search: search || undefined,
          status: status || undefined,
          page,
          limit,
        },
      });

      if (error) {
        throw error;
      }

      // Normalise various possible response shapes from the Edge Function
      let users = [];
      let total = 0;
      let currentPage = page;
      let currentLimit = limit;
      let totalPages = 0;

      if (!data) {
        // No data – return an empty, but well-shaped, response
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      if (Array.isArray(data)) {
        // Raw array of users
        users = data;
        total = data.length;
        totalPages = total > 0 ? 1 : 0;
      } else if (Array.isArray(data.users)) {
        // { users, total, page, limit, totalPages }
        users = data.users;
        total = typeof data.total === 'number' ? data.total : users.length;
        currentPage = typeof data.page === 'number' ? data.page : page;
        currentLimit = typeof data.limit === 'number' ? data.limit : limit;
        totalPages = typeof data.totalPages === 'number'
          ? data.totalPages
          : (currentLimit > 0 ? Math.ceil(total / currentLimit) : 0);
      } else if (Array.isArray(data.data)) {
        // { data, total, page, limit, totalPages }
        users = data.data;
        total = typeof data.total === 'number' ? data.total : users.length;
        currentPage = typeof data.page === 'number' ? data.page : page;
        currentLimit = typeof data.limit === 'number' ? data.limit : limit;
        totalPages = typeof data.totalPages === 'number'
          ? data.totalPages
          : (currentLimit > 0 ? Math.ceil(total / currentLimit) : 0);
      } else if (typeof data === 'object') {
        // Single user object – wrap in an array
        users = [data];
        total = 1;
        totalPages = 1;
      }

      // Normalise each user object into the shape expected by the UI
      const normalisedUsers = users.map((item) => {
        // New aggregated shape from Edge Function: { user, character, theme_scores, analytics, streaks, subscription }
        if (item && item.user && (item.character || item.analytics || item.streaks || item.subscription)) {
          const base = item.user || {};
          const character = item.character || {};
          const analytics = item.analytics || {};
          const streaks = item.streaks || {};
          const subscription = item.subscription || {};
          const themeScores = item.theme_scores || {};
          const onboardedAt = base.onboarded_at || item.onboarded_at || null;

          return {
            // Core identity
            id: base.id || item.id,
            name: base.name || item.name || '',
            email: base.email || item.email || '',
            phone: base.phone || item.phone || '',

            // Tier & character
            tier: base.tier || item.tier || '',
            character: character.name || base.character || item.character || '',

            // Progress / journey
            currentDay: streaks.current_day || base.currentDay || item.currentDay || 0,
            plotTwists: analytics.plot_twists || base.plotTwists || item.plotTwists || 0,

            // Activity / engagement
            quickShifts: analytics.quick_shifts || base.quickShifts || item.quickShifts || 0,
            toolsCreated: analytics.tools_created || base.toolsCreated || item.toolsCreated || 0,
            engagementScore: analytics.engagement_score || base.engagementScore || item.engagementScore || 0,
            lastActive: analytics.last_active || base.lastActive || item.lastActive || '',

            // Status (e.g. subscription / user status)
            status: subscription.status || base.status || item.status || (onboardedAt ? 'Active' : 'Inactive'),

            // Theme scores (for detailed scoring view)
            overallScore: typeof themeScores.overall_score === 'number'
              ? themeScores.overall_score
              : null,
            themeScores: {
              awareness: themeScores.awareness ?? null,
              light: themeScores.light ?? null,
              intention: themeScores.intention ?? null,
              nowness: themeScores.nowness ?? null,
              gratitude: themeScores.gratitude ?? null,
              expansion: themeScores.expansion ?? null,
              devotion: themeScores.devotion ?? null,
              overall: themeScores.overall_score ?? null,
              lastActivityAt: themeScores.last_activity_at || null,
            },
          };
        }

        // Fallback: legacy flat user shape
        return item;
      });

      return {
        data: normalisedUsers,
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages,
      };
    } catch (error) {
      // Log a readable error and rethrow so hooks can surface it
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * Uses the same Supabase function with an id filter.
   *
   * @param {string} id - User ID
   * @returns {Promise<any | null>}
   */
  async getUserById(id) {
    if (!id) return null;

    try {
      const { data, error } = await supabase.functions.invoke('admin-user-fetch', {
        body: { id },
      });

      if (error) {
        throw error;
      }

      if (!data) return null;

      if (Array.isArray(data)) {
        return data.find((u) => u.id === id) || null;
      }

      if (Array.isArray(data.users)) {
        return data.users.find((u) => u.id === id) || null;
      }

      if (Array.isArray(data.data)) {
        return data.data.find((u) => u.id === id) || null;
      }

      // If the function already returns a single user object
      if (typeof data === 'object') {
        return data;
      }

      return null;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Update user information
   * Stubbed for now – can be wired to another Edge Function later.
   *
   * @param {string} id - User ID
   * @param {Object} data - Updated user data
   * @returns {Promise<null>}
   */
  // eslint-disable-next-line no-unused-vars
  async updateUser(id, data) {
    return null;
  }

  /**
   * Get user engagement metrics
   * Stubbed for now – kept for API compatibility.
   *
   * @param {string} id - User ID
   * @returns {Promise<Object>}
   */
  // eslint-disable-next-line no-unused-vars
  async getUserEngagement(id) {
    return {};
  }

  /**
   * Get user activity log
   * Stubbed for now – kept for API compatibility.
   *
   * @param {string} id - User ID
   * @param {Object} [params]
   * @returns {Promise<Array>}
   */
  // eslint-disable-next-line no-unused-vars
  async getUserActivity(id, params = {}) {
    return [];
  }
}

// Export singleton instance
export default new UserService();
