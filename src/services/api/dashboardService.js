/**
 * Dashboard Service
 * API service for dashboard statistics and activity
 * 
 * NOTE: Dashboard endpoints are NOT in the admin-service OpenAPI spec.
 * These methods return empty/default data to prevent API calls to non-existent endpoints.
 * The UI will display empty states instead of making invalid API requests.
 */

class DashboardService {
  /**
   * Get dashboard statistics
   * Returns empty stats since this endpoint is not in the OpenAPI spec
   * @returns {Promise<Object>}
   */
  async getStats() {
    // Return empty stats object to prevent API call to non-existent endpoint
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalContent: 0,
      activeContent: 0,
    };
  }

  /**
   * Get recent activity feed
   * Returns empty array since this endpoint is not in the OpenAPI spec
   * @param {Object} [params] - Query parameters (ignored)
   * @returns {Promise<Array>}
   */
  async getRecentActivity(params = {}) {
    // Return empty array to prevent API call to non-existent endpoint
    return [];
  }

  /**
   * Get content health metrics
   * Returns empty array since this endpoint is not in the OpenAPI spec
   * @returns {Promise<Array>}
   */
  async getContentHealth() {
    // Return empty array to prevent API call to non-existent endpoint
    return [];
  }
}

// Export singleton instance
export default new DashboardService();

