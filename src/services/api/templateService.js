/**
 * Template Service
 * API service for Affirmation and Meditation templates
 * Uses admin-service microservice
 */

import adminServiceClient from '@/lib/api/adminServiceClient';
import { ADMIN_SERVICE_ENDPOINTS } from '@/lib/api/adminServiceConfig';
import supabase from '@/lib/supabaseClient';
import { handleApiError } from '@/utils/apiHelpers';
import { buildFilterParams } from '@/utils/queryBuilder';
import BaseService from './baseService';

class TemplateService extends BaseService {
  constructor() {
    super(ADMIN_SERVICE_ENDPOINTS.AFFIRMATION_TEMPLATES, adminServiceClient);
  }

  /**
   * Get all affirmation templates with pagination
   * @param {Object} [params] - Query parameters
   * @returns {Promise<{data: import('@/models').AffirmationTemplate[], total?: number, page?: number, limit?: number}>}
   */
  async getAffirmationTemplates(params = {}) {
    const { page = 1, limit = 1000, search, characterId, isActive } = params;
    
    try {
      // 1. Try Supabase first
      let query = supabase.from('affirmation_templates').select('*', { count: 'exact' });

      if (search) {
        query = query.or(`template_name.ilike.%${search}%,energy_type.ilike.%${search}%`);
      }
      if (characterId) {
        query = query.eq('character_id', characterId);
      }
      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        const normalizedData = data.map(item => ({
          id: item.id,
          templateName: item.template_name || item.name,
          energyType: item.energy_type,
          imageryTheme: item.imagery_theme,
          openingPhrase: item.opening_phrase,
          templateStructure: item.template_structure,
          sampleOutput: item.sample_output,
          characterId: item.character_id,
          adminContext: item.admin_context,
          isActive: item.is_active ?? true,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));

        return {
          data: normalizedData,
          total: count || normalizedData.length,
          page,
          limit
        };
      }

      // 2. Fallback to API if Supabase is empty or if that's the desired flow
      const response = await adminServiceClient.get(ADMIN_SERVICE_ENDPOINTS.AFFIRMATION_TEMPLATES, { 
        params: { page, limit, search, characterId, isActive } 
      });
      return response.data;

    } catch (error) {
      console.error('[getAffirmationTemplates] Supabase fetch failed, falling back to API:', error);
      try {
        const response = await adminServiceClient.get(ADMIN_SERVICE_ENDPOINTS.AFFIRMATION_TEMPLATES, { 
          params: { page, limit, search, characterId, isActive } 
        });
        return response.data;
      } catch (apiError) {
        throw handleApiError(apiError);
      }
    }
  }

  /**
   * Get affirmation template by ID
   * @param {string} id - Template ID
   * @returns {Promise<import('@/models').AffirmationTemplate>}
   */
  async getAffirmationTemplateById(id) {
    try {
      const { data, error } = await supabase
        .from('affirmation_templates')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      return {
        id: data.id,
        templateName: data.template_name || data.name,
        energyType: data.energy_type,
        imageryTheme: data.imagery_theme,
        openingPhrase: data.opening_phrase,
        templateStructure: data.template_structure,
        sampleOutput: data.sample_output,
        characterId: data.character_id,
        adminContext: data.admin_context,
        isActive: data.is_active ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.warn('[getAffirmationTemplateById] Supabase fetch failed, falling back to API:', error);
      try {
        const response = await adminServiceClient.get(ADMIN_SERVICE_ENDPOINTS.AFFIRMATION_TEMPLATE_BY_ID(id));
        return response.data;
      } catch (apiError) {
        throw handleApiError(apiError);
      }
    }
  }

  /**
   * Create a new affirmation template
   * @param {Object} data - Template data
   * @returns {Promise<import('@/models').AffirmationTemplate>}
   */
  async createAffirmationTemplate(data) {
    try {
      const response = await adminServiceClient.post(ADMIN_SERVICE_ENDPOINTS.AFFIRMATION_TEMPLATES, data);
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
      const { error } = await supabase
        .from('affirmation_templates')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
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
    const { page = 1, limit = 1000, search, isActive } = params;
    try {
      // 1. Try Supabase first
      let query = supabase.from('meditation_templates').select('*');

      if (search) {
        query = query.or(`name.ilike.%${search}%,feeling.ilike.%${search}%,setting.ilike.%${search}%`);
      }
      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          templateName: item.template_name || item.name,
          energyType: item.energy_type || item.feeling,
          imageryTheme: item.imagery_theme || item.setting,
          openingPhrase: item.opening_phrase,
          templateStructure: item.template_structure,
          sampleOutput: item.sample_output || item.sample_script,
          meditationContext: item.meditation_context,
          instructions: item.instructions,
          characterId: item.character_id,
          coachInstruction: item.coach_instruction || {},
          isActive: item.is_active ?? true,
          usageCount: item.usage_count || 0,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));
      }

      // 2. Fallback to API
      const filterParams = buildFilterParams(params);
      const response = await adminServiceClient.get(ADMIN_SERVICE_ENDPOINTS.MEDITATION_TEMPLATES, { params: filterParams });
      return Array.isArray(response.data) ? response.data : (response.data.data || response.data.items || []);
    } catch (error) {
      console.error('[getMeditationTemplates] Supabase fetch failed, falling back to API:', error);
      try {
        const filterParams = buildFilterParams(params);
        const response = await adminServiceClient.get(ADMIN_SERVICE_ENDPOINTS.MEDITATION_TEMPLATES, { params: filterParams });
        return Array.isArray(response.data) ? response.data : (response.data.data || response.data.items || []);
      } catch (apiError) {
        throw handleApiError(apiError);
      }
    }
  }

  /**
   * Get meditation template by ID
   * @param {string} id - Template ID
   * @returns {Promise<import('@/models').MeditationTemplate>}
   */
  async getMeditationTemplateById(id) {
    try {
      const { data, error } = await supabase
        .from('meditation_templates')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      return {
        id: data.id,
        templateName: data.template_name || data.name,
        energyType: data.energy_type || data.feeling,
        imageryTheme: data.imagery_theme || data.setting,
        openingPhrase: data.opening_phrase,
        templateStructure: data.template_structure,
        sampleOutput: data.sample_output || data.sample_script,
        meditationContext: data.meditation_context,
        instructions: data.instructions,
        characterId: data.character_id,
        coachInstruction: data.coach_instruction || {},
        isActive: data.is_active ?? true,
        usageCount: data.usage_count || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.warn('[getMeditationTemplateById] Supabase fetch failed, falling back to API:', error);
      try {
        const response = await adminServiceClient.get(ADMIN_SERVICE_ENDPOINTS.MEDITATION_TEMPLATE_BY_ID(id));
        return response.data;
      } catch (apiError) {
        throw handleApiError(apiError);
      }
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
      const { error } = await supabase
        .from('meditation_templates')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Export singleton instance
export default new TemplateService();

