/**
 * Template Service
 * API service for Affirmation and Meditation templates
 * Uses local backend
 */

import BaseService from './baseService';
import { LOCAL_BACKEND_ENDPOINTS } from '@/lib/api/localBackendConfig';
import localBackendClient from '@/lib/api/localBackendClient';
import { handleApiError } from '@/utils/apiHelpers';
import { buildFilterParams } from '@/utils/queryBuilder';

class TemplateService extends BaseService {
  constructor() {
    super(LOCAL_BACKEND_ENDPOINTS.AFFIRMATION_TEMPLATES, localBackendClient);
  }

  /**
   * Get all affirmation templates
   * @param {Object} [params] - Query parameters
   * @returns {Promise<import('@/models').AffirmationTemplate[]>}
   */
  async getAffirmationTemplates(params = {}) {
    try {
      const filterParams = buildFilterParams(params);
      const response = await localBackendClient.get(LOCAL_BACKEND_ENDPOINTS.AFFIRMATION_TEMPLATES, { params: filterParams });
      return Array.isArray(response.data) ? response.data : (response.data.data || response.data.items || []);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get affirmation template by ID
   * @param {string} id - Template ID
   * @returns {Promise<import('@/models').AffirmationTemplate>}
   */
  async getAffirmationTemplateById(id) {
    try {
      const response = await localBackendClient.get(LOCAL_BACKEND_ENDPOINTS.AFFIRMATION_TEMPLATE_BY_ID(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new affirmation template
   * @param {Object} data - Template data
   * @returns {Promise<import('@/models').AffirmationTemplate>}
   */
  async createAffirmationTemplate(data) {
    try {
      const response = await localBackendClient.post(LOCAL_BACKEND_ENDPOINTS.AFFIRMATION_TEMPLATES, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update an affirmation template
   * @param {string} id - Template ID
   * @param {Object} data - Updated template data
   * @returns {Promise<import('@/models').AffirmationTemplate>}
   */
  async updateAffirmationTemplate(id, data) {
    try {
      const response = await localBackendClient.put(LOCAL_BACKEND_ENDPOINTS.AFFIRMATION_TEMPLATE_BY_ID(id), data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete an affirmation template
   * @param {string} id - Template ID
   * @returns {Promise<void>}
   */
  async deleteAffirmationTemplate(id) {
    try {
      await localBackendClient.delete(LOCAL_BACKEND_ENDPOINTS.AFFIRMATION_TEMPLATE_BY_ID(id));
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get all meditation templates
   * @param {Object} [params] - Query parameters
   * @returns {Promise<import('@/models').MeditationTemplate[]>}
   */
  async getMeditationTemplates(params = {}) {
    try {
      const filterParams = buildFilterParams(params);
      const response = await localBackendClient.get(LOCAL_BACKEND_ENDPOINTS.MEDITATION_TEMPLATES, { params: filterParams });
      return Array.isArray(response.data) ? response.data : (response.data.data || response.data.items || []);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get meditation template by ID
   * @param {string} id - Template ID
   * @returns {Promise<import('@/models').MeditationTemplate>}
   */
  async getMeditationTemplateById(id) {
    try {
      const response = await localBackendClient.get(LOCAL_BACKEND_ENDPOINTS.MEDITATION_TEMPLATE_BY_ID(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new meditation template
   * @param {Object} data - Template data
   * @returns {Promise<import('@/models').MeditationTemplate>}
   */
  async createMeditationTemplate(data) {
    try {
      const response = await localBackendClient.post(LOCAL_BACKEND_ENDPOINTS.MEDITATION_TEMPLATES, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update a meditation template
   * @param {string} id - Template ID
   * @param {Object} data - Updated template data
   * @returns {Promise<import('@/models').MeditationTemplate>}
   */
  async updateMeditationTemplate(id, data) {
    try {
      const response = await localBackendClient.put(LOCAL_BACKEND_ENDPOINTS.MEDITATION_TEMPLATE_BY_ID(id), data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete a meditation template
   * @param {string} id - Template ID
   * @returns {Promise<void>}
   */
  async deleteMeditationTemplate(id) {
    try {
      await localBackendClient.delete(LOCAL_BACKEND_ENDPOINTS.MEDITATION_TEMPLATE_BY_ID(id));
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Export singleton instance
export default new TemplateService();

