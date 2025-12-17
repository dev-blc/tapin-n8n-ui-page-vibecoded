/**
 * Template Service
 * API service for Affirmation and Meditation templates
 * Uses admin-service microservice
 */

import BaseService from './baseService';
import { ADMIN_SERVICE_ENDPOINTS } from '@/lib/api/adminServiceConfig';
import adminServiceClient from '@/lib/api/adminServiceClient';
import { handleApiError } from '@/utils/apiHelpers';
import { buildFilterParams } from '@/utils/queryBuilder';

class TemplateService extends BaseService {
  constructor() {
    super(ADMIN_SERVICE_ENDPOINTS.AFFIRMATION_TEMPLATES, adminServiceClient);
  }

  /**
   * Get all affirmation templates with pagination
   * @param {Object} [params] - Query parameters
   * @param {number} [params.page] - Page number (default: 1)
   * @param {number} [params.limit] - Items per page (default: 20)
   * @param {string} [params.search] - Search query
   * @param {string} [params.characterId] - Filter by character ID
   * @param {boolean} [params.isActive] - Filter by active status
   * @returns {Promise<{data: import('@/models').AffirmationTemplate[], total?: number, page?: number, limit?: number}>}
   */
  async getAffirmationTemplates(params = {}) {
    try {
      // Build query parameters according to OpenAPI spec
      const queryParams = {};
      
      if (params.page !== undefined) {
        queryParams.page = params.page;
      }
      if (params.limit !== undefined) {
        queryParams.limit = params.limit;
      }
      if (params.search) {
        queryParams.search = params.search;
      }
      if (params.characterId) {
        queryParams.characterId = params.characterId;
      }
      if (params.isActive !== undefined) {
        queryParams.isActive = params.isActive;
      }
      
      const response = await adminServiceClient.get(ADMIN_SERVICE_ENDPOINTS.AFFIRMATION_TEMPLATES, { params: queryParams });
      
      // Handle paginated response
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        // Paginated response with data array
        return response.data;
      }
      
      // Fallback for array response
      return {
        data: Array.isArray(response.data) ? response.data : [],
        total: response.data?.total || response.data?.length || 0,
        page: params.page || 1,
        limit: params.limit || 20
      };
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
      const response = await adminServiceClient.get(ADMIN_SERVICE_ENDPOINTS.AFFIRMATION_TEMPLATE_BY_ID(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new affirmation template
   * @param {Object} data - Template data matching CreateAffirmationTemplateDto
   * @param {string} data.templateName - Template name (required)
   * @param {string} [data.energyType] - Energy type
   * @param {string} [data.imageryTheme] - Imagery theme
   * @param {string} [data.openingPhrase] - Opening phrase
   * @param {string} [data.templateStructure] - Template structure
   * @param {string} [data.sampleOutput] - Sample output
   * @param {string} [data.characterId] - Character ID
   * @param {string} [data.adminContext] - Admin context
   * @param {boolean} [data.isActive] - Is active (default: true)
   * @returns {Promise<import('@/models').AffirmationTemplate>}
   */
  async createAffirmationTemplate(data) {
    try {
      // Build payload according to CreateAffirmationTemplateDto
      const payload = {
        templateName: data.templateName,
      };
      
      // Add optional fields if provided
      if (data.energyType !== undefined && data.energyType !== '') {
        payload.energyType = data.energyType;
      }
      if (data.imageryTheme !== undefined && data.imageryTheme !== '') {
        payload.imageryTheme = data.imageryTheme;
      }
      if (data.openingPhrase !== undefined && data.openingPhrase !== '') {
        payload.openingPhrase = data.openingPhrase;
      }
      if (data.templateStructure !== undefined && data.templateStructure !== '') {
        payload.templateStructure = data.templateStructure;
      }
      if (data.sampleOutput !== undefined && data.sampleOutput !== '') {
        payload.sampleOutput = data.sampleOutput;
      }
      if (data.characterId !== undefined && data.characterId !== '') {
        payload.characterId = data.characterId;
      }
      if (data.adminContext !== undefined && data.adminContext !== '') {
        payload.adminContext = data.adminContext;
      }
      if (data.isActive !== undefined) {
        payload.isActive = data.isActive;
      } else {
        payload.isActive = true; // Default to true
      }
      
      const response = await adminServiceClient.post(ADMIN_SERVICE_ENDPOINTS.AFFIRMATION_TEMPLATES, payload);
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
      const response = await adminServiceClient.put(ADMIN_SERVICE_ENDPOINTS.AFFIRMATION_TEMPLATE_BY_ID(id), data);
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
      await adminServiceClient.delete(ADMIN_SERVICE_ENDPOINTS.AFFIRMATION_TEMPLATE_BY_ID(id));
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
      const response = await adminServiceClient.get(ADMIN_SERVICE_ENDPOINTS.MEDITATION_TEMPLATES, { params: filterParams });
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
      const response = await adminServiceClient.get(ADMIN_SERVICE_ENDPOINTS.MEDITATION_TEMPLATE_BY_ID(id));
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
      const response = await adminServiceClient.post(ADMIN_SERVICE_ENDPOINTS.MEDITATION_TEMPLATES, data);
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
      const response = await adminServiceClient.put(ADMIN_SERVICE_ENDPOINTS.MEDITATION_TEMPLATE_BY_ID(id), data);
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
      await adminServiceClient.delete(ADMIN_SERVICE_ENDPOINTS.MEDITATION_TEMPLATE_BY_ID(id));
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Export singleton instance
export default new TemplateService();

