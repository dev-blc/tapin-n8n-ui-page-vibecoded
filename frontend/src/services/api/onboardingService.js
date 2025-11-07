/**
 * Onboarding Service
 * API service for onboarding questions and options
 * Uses admin-service microservice
 */

import BaseService from './baseService';
import { ADMIN_SERVICE_ENDPOINTS } from '@/lib/api/adminServiceConfig';
import { LOCAL_BACKEND_ENDPOINTS } from '@/lib/api/localBackendConfig';
import adminServiceClient from '@/lib/api/adminServiceClient';
import localBackendClient from '@/lib/api/localBackendClient';
import { transformQuestionResponse, transformOptionResponse } from '@/utils/dataTransformers';
import { handleApiError } from '@/utils/apiHelpers';

class OnboardingService extends BaseService {
  constructor() {
    super(ADMIN_SERVICE_ENDPOINTS.ONBOARDING_QUESTIONS, adminServiceClient);
  }

  /**
   * Get all onboarding questions
   * @returns {Promise<import('@/models').OnboardingQuestion[]>}
   */
  async getQuestions() {
    const response = await this.getAll();
    const questions = Array.isArray(response) ? response : (response.data || response.items || []);
    return questions.map(transformQuestionResponse);
  }

  /**
   * Get question by ID
   * @param {string} id - Question ID
   * @returns {Promise<import('@/models').OnboardingQuestion>}
   */
  async getQuestionById(id) {
    const response = await this.getById(id);
    return transformQuestionResponse(response);
  }

  /**
   * Create a new onboarding question
   * @param {Object} data - Question data
   * @param {string} data.text - Question text
   * @param {number} data.displayOrder - Display order
   * @param {boolean} data.isActive - Whether question is active
   * @returns {Promise<import('@/models').OnboardingQuestion>}
   */
  async createQuestion(data) {
    const response = await this.create(data);
    return transformQuestionResponse(response);
  }

  /**
   * Update an onboarding question
   * @param {string} id - Question ID
   * @param {Object} data - Updated question data
   * @returns {Promise<import('@/models').OnboardingQuestion>}
   */
  async updateQuestion(id, data) {
    const response = await this.update(id, data);
    return transformQuestionResponse(response);
  }

  /**
   * Delete an onboarding question
   * @param {string} id - Question ID
   * @returns {Promise<void>}
   */
  async deleteQuestion(id) {
    return this.deleteById(id);
  }

  /**
   * Create a new onboarding option
   * @param {Object} data - Option data
   * @param {string} data.questionId - Parent question ID
   * @param {string} data.optionText - Option text
   * @param {number} data.displayOrder - Display order
   * @param {string} data.assignsTier - Tier to assign
   * @param {string} [data.assignsCharacterId] - Character ID to assign
   * @returns {Promise<import('@/models').OnboardingOption>}
   */
  async createOption(data) {
    try {
      const response = await adminServiceClient.post(ADMIN_SERVICE_ENDPOINTS.ONBOARDING_OPTIONS, data);
      return transformOptionResponse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update an onboarding option
   * @param {string} id - Option ID
   * @param {Object} data - Updated option data
   * @returns {Promise<import('@/models').OnboardingOption>}
   */
  async updateOption(id, data) {
    try {
      const response = await adminServiceClient.put(ADMIN_SERVICE_ENDPOINTS.ONBOARDING_OPTION_BY_ID(id), data);
      return transformOptionResponse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete an onboarding option
   * @param {string} id - Option ID
   * @returns {Promise<void>}
   */
  async deleteOption(id) {
    try {
      await adminServiceClient.delete(ADMIN_SERVICE_ENDPOINTS.ONBOARDING_OPTION_BY_ID(id));
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get character mapping (name to UUID)
   * @returns {Promise<import('@/models').CharacterMapping[]>}
   */
  async getCharacterMapping() {
    // Character mapping is handled by local backend, not admin-service
    try {
      const response = await localBackendClient.get(LOCAL_BACKEND_ENDPOINTS.CHARACTER_MAPPING);
      return Array.isArray(response.data) ? response.data : (response.data.data || response.data.items || []);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Export singleton instance
export default new OnboardingService();

