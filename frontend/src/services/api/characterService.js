/**
 * Character Service
 * API service for character archetype CRUD operations
 * Uses admin-service microservice
 */

import BaseService from './baseService';
import { ADMIN_SERVICE_ENDPOINTS } from '@/lib/api/adminServiceConfig';
import adminServiceClient from '@/lib/api/adminServiceClient';
import { handleApiError } from '@/utils/apiHelpers';

class CharacterService extends BaseService {
  constructor() {
    super(ADMIN_SERVICE_ENDPOINTS.CHARACTERS, adminServiceClient);
  }

  /**
   * Get all characters
   * @returns {Promise<import('@/models').CharacterResponseDto[]>}
   */
  async getCharacters() {
    try {
      const response = await this.getAll();
      return Array.isArray(response) ? response : (response.data || response.items || []);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get character by ID
   * @param {string} id - Character ID
   * @returns {Promise<import('@/models').CharacterResponseDto>}
   */
  async getCharacterById(id) {
    try {
      const response = await this.getById(id);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new character archetype
   * @param {import('@/models').CreateCharacterDto} data - Character data
   * @param {string} data.name - Character name
   * @param {string} [data.description] - Character description
   * @param {string} [data.emoji] - Character emoji
   * @returns {Promise<import('@/models').CharacterResponseDto>}
   */
  async createCharacter(data) {
    try {
      const response = await this.create(data);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update a character archetype
   * @param {string} id - Character ID
   * @param {import('@/models').UpdateCharacterDto} data - Updated character data
   * @returns {Promise<import('@/models').CharacterResponseDto>}
   */
  async updateCharacter(id, data) {
    try {
      const response = await this.update(id, data);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete a character
   * @param {string} id - Character ID
   * @returns {Promise<void>}
   */
  async deleteCharacter(id) {
    try {
      await this.deleteById(id);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Export singleton instance
export default new CharacterService();


