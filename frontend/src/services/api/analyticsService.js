/**
 * Analytics Service
 * API service for fetching processing intensive analytics from Railway edge function
 */

import { ADMIN_SERVICE_ENDPOINTS } from '@/lib/api/adminServiceConfig';
import analyticsServiceClient from '@/lib/api/analyticsServiceClient';
import { handleApiError } from '@/utils/apiHelpers';

class AnalyticsService {
  /**
   * Get comprehensive analytics overview
   * @returns {Promise<Object>}
   */
  async getOverview() {
    try {
      const response = await analyticsServiceClient.get(ADMIN_SERVICE_ENDPOINTS.ANALYTICS_OVERVIEW);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export default new AnalyticsService();
