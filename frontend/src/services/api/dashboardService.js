/**
 * Dashboard Service
 * API service for dashboard statistics and activity
 * Uses local backend
 */

import BaseService from './baseService';
import { LOCAL_BACKEND_ENDPOINTS } from '@/lib/api/localBackendConfig';
import localBackendClient from '@/lib/api/localBackendClient';
import { transformStatsResponse, transformActivityResponse, transformContentHealthResponse } from '@/utils/dataTransformers';
import { handleApiError } from '@/utils/apiHelpers';

class DashboardService extends BaseService {
  constructor() {
    super(LOCAL_BACKEND_ENDPOINTS.DASHBOARD_STATS, localBackendClient);
  }

  /**
   * Get dashboard statistics
   * @returns {Promise<import('@/models').DashboardStats>}
   */
  async getStats() {
    try {
      const response = await localBackendClient.get(LOCAL_BACKEND_ENDPOINTS.DASHBOARD_STATS);
      return transformStatsResponse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get recent activity feed
   * @param {Object} [params] - Query parameters
   * @param {number} [params.limit] - Number of activities to return
   * @returns {Promise<import('@/models').RecentActivity[]>}
   */
  async getRecentActivity(params = {}) {
    try {
      const { limit = 10, ...otherParams } = params;
      const response = await localBackendClient.get(LOCAL_BACKEND_ENDPOINTS.DASHBOARD_ACTIVITY, {
        params: { limit, ...otherParams },
      });
      const activities = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || response.data.items || []);
      return activities.map(transformActivityResponse);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get content health metrics
   * @returns {Promise<import('@/models').ContentHealth[]>}
   */
  async getContentHealth() {
    try {
      const response = await localBackendClient.get(LOCAL_BACKEND_ENDPOINTS.DASHBOARD_CONTENT_HEALTH);
      const healthData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || response.data.items || []);
      return healthData.map(transformContentHealthResponse);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Export singleton instance
export default new DashboardService();

