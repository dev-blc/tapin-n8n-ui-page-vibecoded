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
      const payload = {
        template_name: data.templateName,
        energy_type: data.energyType,
        imagery_theme: data.imageryTheme,
        opening_phrase: data.openingPhrase,
        template_structure: data.templateStructure,
        sample_output: data.sampleOutput,
        character_id: data.characterId,
        admin_context: data.adminContext,
        is_active: data.isActive !== undefined ? data.isActive : true
      };
      
      const { data: result, error } = await supabase
        .from('affirmation_templates')
        .insert([payload])
        .select()
        .single();
        
      if (error) throw error;
      return result;
    } catch (error) {
      console.error('[createAffirmationTemplate] Supabase insert failed:', error);
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
      const payload = {};
      if (data.templateName) payload.template_name = data.templateName;
      if (data.energyType) payload.energy_type = data.energyType;
      if (data.imageryTheme) payload.imagery_theme = data.imageryTheme;
      if (data.openingPhrase) payload.opening_phrase = data.openingPhrase;
      if (data.templateStructure) payload.template_structure = data.templateStructure;
      if (data.sampleOutput) payload.sample_output = data.sampleOutput;
      if (data.characterId) payload.character_id = data.characterId;
      if (data.adminContext) payload.admin_context = data.adminContext;
      if (data.isActive !== undefined) payload.is_active = data.isActive;

      const { data: result, error } = await supabase
        .from('affirmation_templates')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
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
          name: item.name,
          feeling: item.feeling,
          setting: item.setting,
          elements: item.elements || [],
          duration: item.duration,
          sampleScript: item.sample_script,
          usageCount: item.usage_count || 0,
          status: item.is_active === false ? 'Inactive' : 'Active',
          lastModified: item.updated_at || item.created_at
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
        name: data.name,
        feeling: data.feeling,
        setting: data.setting,
        elements: data.elements || [],
        duration: data.duration,
        sampleScript: data.sample_script,
        usageCount: data.usage_count || 0,
        status: data.is_active === false ? 'Inactive' : 'Active',
        lastModified: data.updated_at || data.created_at
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
      const payload = {
        name: data.name,
        feeling: data.feeling,
        setting: data.setting,
        elements: data.elements || [],
        duration: data.duration,
        sample_script: data.sampleScript,
        is_active: data.isActive !== undefined ? data.isActive : true
      };
      
      const { data: result, error } = await supabase
        .from('meditation_templates')
        .insert([payload])
        .select()
        .single();
        
      if (error) throw error;
      return result;
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
      const payload = {};
      if (data.name) payload.name = data.name;
      if (data.feeling) payload.feeling = data.feeling;
      if (data.setting) payload.setting = data.setting;
      if (data.elements) payload.elements = data.elements;
      if (data.duration) payload.duration = data.duration;
      if (data.sampleScript) payload.sample_script = data.sampleScript;
      if (data.isActive !== undefined) payload.is_active = data.isActive;

      const { data: result, error } = await supabase
        .from('meditation_templates')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
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

