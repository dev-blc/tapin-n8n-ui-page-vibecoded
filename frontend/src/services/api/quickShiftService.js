/**
 * Quick Shift Service
 * API service for Quick Shift loops, reframes, and protectors
 * Uses local backend
 */

import BaseService from './baseService';
import { LOCAL_BACKEND_ENDPOINTS } from '@/lib/api/localBackendConfig';
import localBackendClient from '@/lib/api/localBackendClient';
import { handleApiError } from '@/utils/apiHelpers';
import { buildFilterParams, combineQueryParams } from '@/utils/queryBuilder';

class QuickShiftService extends BaseService {
  constructor() {
    super(LOCAL_BACKEND_ENDPOINTS.QUICK_SHIFT_LOOPS, localBackendClient);
  }

  /**
   * Get all Quick Shift loops
   * @param {Object} [params] - Query parameters (filters, etc.)
   * @returns {Promise<import('@/models').QuickShiftLoop[]>}
   */
  async getLoops(params = {}) {
    try {
      const filterParams = buildFilterParams(params);
      const response = await this.getAll(filterParams);
      return Array.isArray(response) ? response : (response.data || response.items || []);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get Quick Shift loop by ID
   * @param {string} id - Loop ID
   * @returns {Promise<import('@/models').QuickShiftLoop>}
   */
  async getLoopById(id) {
    try {
      const response = await this.getById(id);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new Quick Shift loop
   * @param {Object} data - Loop data
   * @returns {Promise<import('@/models').QuickShiftLoop>}
   */
  async createLoop(data) {
    try {
      const response = await this.create(data);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update a Quick Shift loop
   * @param {string} id - Loop ID
   * @param {Object} data - Updated loop data
   * @returns {Promise<import('@/models').QuickShiftLoop>}
   */
  async updateLoop(id, data) {
    try {
      const response = await this.update(id, data);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete a Quick Shift loop
   * @param {string} id - Loop ID
   * @returns {Promise<void>}
   */
  async deleteLoop(id) {
    try {
      await this.deleteById(id);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get all reframes
   * @param {Object} [params] - Query parameters
   * @returns {Promise<import('@/models').QuickShiftReframe[]>}
   */
  async getReframes(params = {}) {
    try {
      const filterParams = buildFilterParams(params);
      const response = await localBackendClient.get(LOCAL_BACKEND_ENDPOINTS.QUICK_SHIFT_REFRAMES, { params: filterParams });
      return Array.isArray(response.data) ? response.data : (response.data.data || response.data.items || []);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get reframe by ID
   * @param {string} id - Reframe ID
   * @returns {Promise<import('@/models').QuickShiftReframe>}
   */
  async getReframeById(id) {
    try {
      const response = await localBackendClient.get(LOCAL_BACKEND_ENDPOINTS.QUICK_SHIFT_REFRAME_BY_ID(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new reframe
   * @param {Object} data - Reframe data
   * @returns {Promise<import('@/models').QuickShiftReframe>}
   */
  async createReframe(data) {
    try {
      const response = await localBackendClient.post(LOCAL_BACKEND_ENDPOINTS.QUICK_SHIFT_REFRAMES, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get all protectors
   * @param {Object} [params] - Query parameters
   * @returns {Promise<import('@/models').QuickShiftProtector[]>}
   */
  async getProtectors(params = {}) {
    try {
      const filterParams = buildFilterParams(params);
      const response = await localBackendClient.get(LOCAL_BACKEND_ENDPOINTS.QUICK_SHIFT_PROTECTORS, { params: filterParams });
      return Array.isArray(response.data) ? response.data : (response.data.data || response.data.items || []);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get protector by ID
   * @param {string} id - Protector ID
   * @returns {Promise<import('@/models').QuickShiftProtector>}
   */
  async getProtectorById(id) {
    try {
      const response = await localBackendClient.get(LOCAL_BACKEND_ENDPOINTS.QUICK_SHIFT_PROTECTOR_BY_ID(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new protector
   * @param {Object} data - Protector data
   * @returns {Promise<import('@/models').QuickShiftProtector>}
   */
  async createProtector(data) {
    try {
      const response = await localBackendClient.post(LOCAL_BACKEND_ENDPOINTS.QUICK_SHIFT_PROTECTORS, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Export singleton instance
export default new QuickShiftService();

