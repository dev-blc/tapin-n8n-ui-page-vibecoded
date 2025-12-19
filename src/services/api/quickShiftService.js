/**
 * Quick Shift Service
 * API service for Quick Shift loops and sensation prompts
 * Uses admin-service
 * 
 * NOTE: Reframes and protectors endpoints have been removed as they are not in the OpenAPI spec.
 */

import BaseService from './baseService';
import { ADMIN_SERVICE_ENDPOINTS } from '@/lib/api/adminServiceConfig';
import adminServiceClient from '@/lib/api/adminServiceClient';
import { handleApiError } from '@/utils/apiHelpers';
import { buildFilterParams } from '@/utils/queryBuilder';

class QuickShiftService extends BaseService {
  constructor() {
    // Use a base endpoint for BaseService, but we'll override methods to use specific endpoints
    super(ADMIN_SERVICE_ENDPOINTS.QUICK_SHIFT_GET_ALL_LOOPS, adminServiceClient);
  }

  /**
   * Get all Quick Shift loops
   * @param {Object} [params] - Query parameters (filters, etc.)
   * @returns {Promise<import('@/models').QuickShiftLoopResponseDto[]>}
   */
  async getLoops(params = {}) {
    try {
      const filterParams = buildFilterParams(params);
      const response = await adminServiceClient.get(ADMIN_SERVICE_ENDPOINTS.QUICK_SHIFT_GET_ALL_LOOPS, { params: filterParams });
      return Array.isArray(response.data) ? response.data : (response.data.data || response.data.items || []);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get Quick Shift loop by ID
   * @param {string} id - Loop ID
   * @returns {Promise<import('@/models').QuickShiftLoopResponseDto>}
   */
  async getLoopById(id) {
    try {
      const response = await adminServiceClient.get(ADMIN_SERVICE_ENDPOINTS.QUICK_SHIFT_LOOP_BY_ID(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new Quick Shift loop
   * @param {import('@/models').CreateQuickShiftLoopDto} data - Loop data
   * @returns {Promise<import('@/models').QuickShiftLoopResponseDto>}
   */
  async createLoop(data) {
    try {
      const response = await adminServiceClient.post(ADMIN_SERVICE_ENDPOINTS.QUICK_SHIFT_CREATE_LOOP, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update a Quick Shift loop
   * @param {string} id - Loop ID
   * @param {import('@/models').UpdateQuickShiftLoopDto} data - Updated loop data
   * @returns {Promise<import('@/models').QuickShiftLoopResponseDto>}
   */
  async updateLoop(id, data) {
    try {
      const response = await adminServiceClient.put(ADMIN_SERVICE_ENDPOINTS.QUICK_SHIFT_UPDATE_LOOP(id), data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete a Quick Shift loop (soft delete)
   * @param {string} id - Loop ID
   * @returns {Promise<void>}
   */
  async deleteLoop(id) {
    try {
      await adminServiceClient.delete(ADMIN_SERVICE_ENDPOINTS.QUICK_SHIFT_DELETE_LOOP(id));
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get all Quick Shift sensation prompts
   * @param {Object} [params] - Query parameters
   * @param {boolean} params.isActive - Filter by active status (required)
   * @returns {Promise<import('@/models').QuickShiftSensationResponseDto[]>}
   */
  async getSensationPrompts(params = {}) {
    try {
      if (params.isActive === undefined) {
        throw new Error('isActive parameter is required');
      }
      const response = await adminServiceClient.get(ADMIN_SERVICE_ENDPOINTS.QUICK_SHIFT_GET_ALL_SENSATIONS, {
        params: { isActive: params.isActive },
      });
      return Array.isArray(response.data) ? response.data : (response.data.data || response.data.items || []);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new Quick Shift sensation prompt
   * @param {import('@/models').CreateQuickShiftSensationDto} data - Sensation prompt data
   * @returns {Promise<import('@/models').QuickShiftSensationResponseDto>}
   */
  async createSensationPrompt(data) {
    try {
      const response = await adminServiceClient.post(ADMIN_SERVICE_ENDPOINTS.QUICK_SHIFT_CREATE_SENSATION, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update a Quick Shift sensation prompt
   * @param {string} id - Sensation prompt ID
   * @param {import('@/models').UpdateQuickShiftSensationDto} data - Updated sensation prompt data
   * @returns {Promise<import('@/models').QuickShiftSensationResponseDto>}
   */
  async updateSensationPrompt(id, data) {
    try {
      const response = await adminServiceClient.put(ADMIN_SERVICE_ENDPOINTS.QUICK_SHIFT_UPDATE_SENSATION(id), data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete a Quick Shift sensation prompt
   * @param {string} id - Sensation prompt ID
   * @returns {Promise<void>}
   */
  async deleteSensationPrompt(id) {
    try {
      await adminServiceClient.delete(ADMIN_SERVICE_ENDPOINTS.QUICK_SHIFT_DELETE_SENSATION(id));
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ============================================================================
  // Stub methods for removed endpoints (reframes/protectors)
  // These endpoints are NOT in the OpenAPI spec and return empty data
  // ============================================================================

  /**
   * Get all reframes (STUB - endpoint not in OpenAPI spec)
   * @param {Object} [params] - Query parameters (ignored)
   * @returns {Promise<Array>}
   */
  async getReframes(params = {}) {
    // Return empty array to prevent API call to non-existent endpoint
    return [];
  }

  /**
   * Get reframe by ID (STUB - endpoint not in OpenAPI spec)
   * @param {string} id - Reframe ID
   * @returns {Promise<null>}
   */
  async getReframeById(id) {
    // Return null to prevent API call to non-existent endpoint
    return null;
  }

  /**
   * Create a new reframe (STUB - endpoint not in OpenAPI spec)
   * @param {Object} data - Reframe data
   * @returns {Promise<null>}
   */
  async createReframe(data) {
    // Return null to prevent API call to non-existent endpoint
    console.warn('createReframe: This endpoint is not available in the OpenAPI spec');
    return null;
  }

  /**
   * Update a reframe (STUB - endpoint not in OpenAPI spec)
   * @param {string} id - Reframe ID
   * @param {Object} data - Updated reframe data
   * @returns {Promise<null>}
   */
  async updateReframe(id, data) {
    // Return null to prevent API call to non-existent endpoint
    console.warn('updateReframe: This endpoint is not available in the OpenAPI spec');
    return null;
  }

  /**
   * Delete a reframe (STUB - endpoint not in OpenAPI spec)
   * @param {string} id - Reframe ID
   * @returns {Promise<void>}
   */
  async deleteReframe(id) {
    // Do nothing to prevent API call to non-existent endpoint
    console.warn('deleteReframe: This endpoint is not available in the OpenAPI spec');
  }

  /**
   * Get all protectors (STUB - endpoint not in OpenAPI spec)
   * @param {Object} [params] - Query parameters (ignored)
   * @returns {Promise<Array>}
   */
  async getProtectors(params = {}) {
    // Return empty array to prevent API call to non-existent endpoint
    return [];
  }

  /**
   * Get protector by ID (STUB - endpoint not in OpenAPI spec)
   * @param {string} id - Protector ID
   * @returns {Promise<null>}
   */
  async getProtectorById(id) {
    // Return null to prevent API call to non-existent endpoint
    return null;
  }

  /**
   * Create a new protector (STUB - endpoint not in OpenAPI spec)
   * @param {Object} data - Protector data
   * @returns {Promise<null>}
   */
  async createProtector(data) {
    // Return null to prevent API call to non-existent endpoint
    console.warn('createProtector: This endpoint is not available in the OpenAPI spec');
    return null;
  }

  /**
   * Update a protector (STUB - endpoint not in OpenAPI spec)
   * @param {string} id - Protector ID
   * @param {Object} data - Updated protector data
   * @returns {Promise<null>}
   */
  async updateProtector(id, data) {
    // Return null to prevent API call to non-existent endpoint
    console.warn('updateProtector: This endpoint is not available in the OpenAPI spec');
    return null;
  }

  /**
   * Delete a protector (STUB - endpoint not in OpenAPI spec)
   * @param {string} id - Protector ID
   * @returns {Promise<void>}
   */
  async deleteProtector(id) {
    // Do nothing to prevent API call to non-existent endpoint
    console.warn('deleteProtector: This endpoint is not available in the OpenAPI spec');
  }
}

// Export singleton instance
export default new QuickShiftService();

