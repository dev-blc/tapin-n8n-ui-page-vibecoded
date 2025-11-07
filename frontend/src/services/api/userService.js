/**
 * User Service
 * API service for user-related operations
 * Uses local backend
 */

import BaseService from './baseService';
import { LOCAL_BACKEND_ENDPOINTS } from '@/lib/api/localBackendConfig';
import localBackendClient from '@/lib/api/localBackendClient';
import { transformUserResponse } from '@/utils/dataTransformers';
import { buildFilterParams, buildPaginationParams, combineQueryParams } from '@/utils/queryBuilder';

class UserService extends BaseService {
  constructor() {
    super(LOCAL_BACKEND_ENDPOINTS.USERS, localBackendClient);
  }

  /**
   * Get all users with optional filters and pagination
   * @param {Object} params - Query parameters
   * @param {string} [params.search] - Search query
   * @param {string} [params.status] - Filter by status
   * @param {string} [params.tier] - Filter by tier
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<import('@/models').PaginatedResponse<import('@/models').User>>}
   */
  async getUsers(params = {}) {
    const { page, limit, ...filters } = params;
    const filterParams = buildFilterParams(filters);
    const paginationParams = buildPaginationParams(page, limit);
    const queryParams = combineQueryParams(filterParams, paginationParams);

    const response = await this.getAll(queryParams);
    
    // Transform response if needed
    if (Array.isArray(response)) {
      return {
        data: response.map(transformUserResponse),
        total: response.length,
        page: 1,
        limit: response.length,
        totalPages: 1,
      };
    }

    return {
      data: (response.data || response.items || []).map(transformUserResponse),
      total: response.total || response.totalCount || 0,
      page: response.page || paginationParams.page,
      limit: response.limit || paginationParams.limit,
      totalPages: response.totalPages || Math.ceil((response.total || 0) / (response.limit || paginationParams.limit)),
    };
  }

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<import('@/models').User>}
   */
  async getUserById(id) {
    const response = await this.getById(id);
    return transformUserResponse(response);
  }

  /**
   * Update user information
   * @param {string} id - User ID
   * @param {Object} data - Updated user data
   * @returns {Promise<import('@/models').User>}
   */
  async updateUser(id, data) {
    const response = await this.update(id, data);
    return transformUserResponse(response);
  }

  /**
   * Get user engagement metrics
   * @param {string} id - User ID
   * @returns {Promise<import('@/models').UserEngagement>}
   */
  async getUserEngagement(id) {
    const response = await this.get(LOCAL_BACKEND_ENDPOINTS.USER_ENGAGEMENT(id));
    return response;
  }

  /**
   * Get user activity log
   * @param {string} id - User ID
   * @param {Object} [params] - Query parameters (limit, offset, etc.)
   * @returns {Promise<import('@/models').UserActivity[]>}
   */
  async getUserActivity(id, params = {}) {
    const response = await this.get(LOCAL_BACKEND_ENDPOINTS.USER_ACTIVITY(id), params);
    return Array.isArray(response) ? response : (response.data || response.items || []);
  }
}

// Export singleton instance
export default new UserService();

