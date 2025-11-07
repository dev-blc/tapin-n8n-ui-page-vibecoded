/**
 * Plot Twist Service
 * API service for Plot Twist quests and characters
 * Uses admin-service for basic CRUD, local backend for extended features
 */

import BaseService from './baseService';
import { ADMIN_SERVICE_ENDPOINTS } from '@/lib/api/adminServiceConfig';
import { LOCAL_BACKEND_ENDPOINTS } from '@/lib/api/localBackendConfig';
import adminServiceClient from '@/lib/api/adminServiceClient';
import localBackendClient from '@/lib/api/localBackendClient';
import { handleApiError } from '@/utils/apiHelpers';
import { buildFilterParams, combineQueryParams } from '@/utils/queryBuilder';

class PlotTwistService extends BaseService {
  constructor() {
    // Use admin-service client for basic CRUD operations
    super(ADMIN_SERVICE_ENDPOINTS.PLOT_TWIST_QUESTS, adminServiceClient);
  }

  /**
   * Get all Plot Twist quests
   * @param {Object} [params] - Query parameters
   * @param {string} [params.character] - Filter by character
   * @param {string} [params.tier] - Filter by tier
   * @param {number} [params.day] - Filter by day
   * @returns {Promise<import('@/models').PlotTwistQuest[]>}
   */
  async getQuests(params = {}) {
    try {
      const filterParams = buildFilterParams(params);
      const response = await this.getAll(filterParams);
      return Array.isArray(response) ? response : (response.data || response.items || []);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get Plot Twist quest by ID
   * @param {string} id - Quest ID
   * @returns {Promise<import('@/models').PlotTwistQuest>}
   */
  async getQuestById(id) {
    try {
      const response = await this.getById(id);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new Plot Twist quest
   * @param {Object} data - Quest data
   * @returns {Promise<import('@/models').PlotTwistQuest>}
   */
  async createQuest(data) {
    try {
      const response = await this.create(data);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update a Plot Twist quest
   * @param {string} id - Quest ID
   * @param {Object} data - Updated quest data
   * @returns {Promise<import('@/models').PlotTwistQuest>}
   */
  async updateQuest(id, data) {
    try {
      const response = await this.update(id, data);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete a Plot Twist quest
   * @param {string} id - Quest ID
   * @returns {Promise<void>}
   */
  async deleteQuest(id) {
    try {
      await this.deleteById(id);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get all Plot Twist characters
   * @returns {Promise<import('@/models').PlotTwistCharacter[]>}
   */
  async getCharacters() {
    // Characters endpoint is handled by local backend
    try {
      const response = await localBackendClient.get(LOCAL_BACKEND_ENDPOINTS.PLOT_TWIST_CHARACTERS);
      return Array.isArray(response.data) ? response.data : (response.data.data || response.data.items || []);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get response options templates
   * @returns {Promise<import('@/models').PlotTwistResponseOption[]>}
   */
  async getResponseOptions() {
    // Response options endpoint is handled by local backend
    try {
      const response = await localBackendClient.get(LOCAL_BACKEND_ENDPOINTS.PLOT_TWIST_RESPONSE_OPTIONS);
      return Array.isArray(response.data) ? response.data : (response.data.data || response.data.items || []);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Export singleton instance
export default new PlotTwistService();

