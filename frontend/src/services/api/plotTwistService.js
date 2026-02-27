/**
 * Plot Twist Service
 * API service for Plot Twist quests and characters
 * Uses admin-service for basic CRUD, local backend for extended features
 */

import adminServiceClient from '@/lib/api/adminServiceClient';
import { ADMIN_SERVICE_ENDPOINTS } from '@/lib/api/adminServiceConfig';
import { handleApiError } from '@/utils/apiHelpers';
import BaseService from './baseService';

class PlotTwistService extends BaseService {
  constructor() {
    // Use admin-service client for basic CRUD operations
    super(ADMIN_SERVICE_ENDPOINTS.PLOT_TWIST_QUESTS, adminServiceClient);
  }

  /**
   * Get all Plot Twist quests with pagination
   * @param {Object} [params] - Query parameters
   * @param {number} [params.page] - Page number (default: 1)
   * @param {number} [params.limit] - Items per page (default: 20)
   * @param {string} [params.search] - Search query
   * @param {string[]} [params.tags] - Filter by tag IDs
   * @param {number} [params.dayNumber] - Filter by day number
   * @param {string} [params.createdBy] - Filter by creator ID
   * @param {string} [params.characterId] - Filter by character ID
   * @param {boolean} [params.isActive] - Filter by active status
   * @returns {Promise<import('@/models').PaginatedPlotTwistResponseDto>}
   */
  async getQuests(params = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        tags,
        dayNumber,
        createdBy,
        characterId,
        isActive,
      } = params;

      const queryParams = {
        page,
        limit,
        ...(search && { search }),
        ...(tags && tags.length > 0 && { tags }),
        ...(dayNumber && { dayNumber }),
        ...(createdBy && { createdBy }),
        ...(characterId && { characterId }),
        ...(isActive !== undefined && { isActive }),
      };

      const response = await this.getAll(queryParams);
      
      // Handle paginated response
      if (response.plotTwists && response.pagination) {
        return response;
      }
      
      // Fallback for non-paginated response
      return {
        plotTwists: Array.isArray(response) ? response : (response.data || response.items || []),
        pagination: {
          total: response.total || 0,
          page: response.page || page,
          limit: response.limit || limit,
          totalPages: response.totalPages || Math.ceil((response.total || 0) / limit),
        },
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get Plot Twist quest by ID
   * Note: The API doesn't have a direct GET by ID endpoint, so this may need to be handled differently
   * @param {string} id - Quest ID
   * @returns {Promise<import('@/models').PlotTwistResponseDto>}
   */
  async getQuestById(id) {
    try {
      // Since there's no GET by ID endpoint in the API, we'll try to use the base endpoint
      // This might need to be adjusted based on actual API behavior
      const response = await this.getById(id);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new Plot Twist quest
   * @param {import('@/models').CreatePlotTwistDto} data - Quest data
   * @returns {Promise<import('@/models').PlotTwistResponseDto>}
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
   * @param {import('@/models').UpdatePlotTwistDto} data - Updated quest data
   * @returns {Promise<import('@/models').PlotTwistResponseDto>}
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
   * Note: This uses the characters endpoint. Consider using characterService.getCharacters() instead.
   * @returns {Promise<import('@/models').CharacterResponseDto[]>}
   */
  async getCharacters() {
    try {
      const response = await adminServiceClient.get(ADMIN_SERVICE_ENDPOINTS.CHARACTERS);
      return Array.isArray(response.data) ? response.data : (response.data.data || response.data.items || []);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get all awareness tiers
   * @returns {Promise<any[]>}
   */
  async getTiers() {
    try {
      // Fetch from the tiers endpoint
      const response = await adminServiceClient.get('/admin/tiers');
      return Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.items || []);
    } catch (error) {
      // If endpoint doesn't exist, return descriptive local data as fallback
      console.warn('Failed to fetch tiers from API, using fallback data:', error);
      return [
        {
          code: '1A',
          name: 'Reactive Awareness - Stage 1',
          scoreRange: '0 - 150',
          toneTag: 'Gentle Guidance',
          toneEssence: 'Focuses on safety, grounding, and simple recognition of emotions without judgment.',
          voiceAnchor: 'You are safe to feel exactly what you are feeling right now.',
          tierUser: '1',
          initialCycle: 'Default Baseline'
        },
        {
          code: '1B',
          name: 'Reactive Awareness - Stage 2',
          scoreRange: '151 - 300',
          toneTag: 'Compassionate Inquiry',
          toneEssence: 'Encourages curiosity about triggers and physical sensations in the body.',
          voiceAnchor: 'Where do you feel this sensation in your body? Let it breathe.',
          tierUser: '1',
          initialCycle: 'Body Scan Focus'
        },
        {
          code: '2A',
          name: 'Proactive Growth - Stage 3',
          scoreRange: '301 - 450',
          toneTag: 'Empowered Action',
          toneEssence: 'Shifts focus toward intentional choice and small, meaningful response shifts.',
          voiceAnchor: 'You have the power to choose your next breath and your next thought.',
          tierUser: '2',
          initialCycle: 'Intention Setting'
        },
        {
          code: '2B',
          name: 'Proactive Growth - Stage 4',
          scoreRange: '451 - 600',
          toneTag: 'Strategic Resilience',
          toneEssence: 'Building tools for navigating complex emotional landscapes with agency.',
          voiceAnchor: 'Challenges are the training ground for your expanding inner strength.',
          tierUser: '2',
          initialCycle: 'Resilience Mapping'
        },
        {
          code: '3A',
          name: 'Creative Expansion - Stage 5',
          scoreRange: '601 - 750',
          toneTag: 'Inspired Flow',
          toneEssence: 'Emphasizes creativity, intuition, and the ability to find meaning in all states.',
          voiceAnchor: 'Your awareness is a vast ocean; every wave is part of your depth.',
          tierUser: '3',
          initialCycle: 'Intuitive Alignment'
        },
        {
          code: '3B',
          name: 'Unified Presence - Stage 6',
          scoreRange: '751 - 1000',
          toneTag: 'Radiant Being',
          toneEssence: 'Full integration of awareness and action. Content is direct, expansive, and subtle.',
          voiceAnchor: 'There is no separation between your growth and the world around you.',
          tierUser: '3',
          initialCycle: 'Unified Field'
        }
      ];
    }
  }

  /**
   * Update a single plot twist option
   * @param {string} id - Option ID
   * @param {import('@/models').UpdatePlotTwistOptionDto} data - Updated option data
   * @returns {Promise<void>}
   */
  async updateOption(id, data) {
    try {
      await adminServiceClient.put(ADMIN_SERVICE_ENDPOINTS.PLOT_TWIST_OPTION_BY_ID(id), data);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete a plot twist option
   * @param {string} id - Option ID
   * @returns {Promise<void>}
   */
  async deleteOption(id) {
    try {
      await adminServiceClient.delete(ADMIN_SERVICE_ENDPOINTS.PLOT_TWIST_OPTION_BY_ID(id));
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update a plot twist response
   * @param {string} id - Response ID
   * @param {import('@/models').UpdatePlotTwistResponseDto} data - Updated response data
   * @returns {Promise<void>}
   */
  async updateResponse(id, data) {
    try {
      await adminServiceClient.put(ADMIN_SERVICE_ENDPOINTS.PLOT_TWIST_RESPONSE_BY_ID(id), data);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete a plot twist response
   * @param {string} id - Response ID
   * @returns {Promise<void>}
   */
  async deleteResponse(id) {
    try {
      await adminServiceClient.delete(ADMIN_SERVICE_ENDPOINTS.PLOT_TWIST_RESPONSE_BY_ID(id));
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get response options (STUB - endpoint not in OpenAPI spec)
   * Returns empty array since this endpoint is not in the OpenAPI spec
   * @returns {Promise<Array>}
   */
  async getResponseOptions() {
    // Return empty array to prevent API call to non-existent endpoint
    return [];
  }
}

// Export singleton instance
export default new PlotTwistService();

