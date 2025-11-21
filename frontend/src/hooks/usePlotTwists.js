/**
 * Plot Twist Hooks
 * React hooks for Plot Twist-related API operations
 */

import { useApi, useMutation } from './useApi';
import plotTwistService from '@/services/api/plotTwistService';

/**
 * Hook to fetch all Plot Twist quests
 * @param {Object} options - Hook options
 * @param {Object} options.params - Query parameters (character, tier, day, etc.)
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const usePlotTwistQuests = (options = {}) => {
  const { params = {}, ...restOptions } = options;
  return useApi(
    () => plotTwistService.getQuests(params),
    [JSON.stringify(params)],
    restOptions
  );
};

/**
 * Hook to fetch a single Plot Twist quest by ID
 * @param {string} questId - Quest ID
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const usePlotTwistQuest = (questId, options = {}) => {
  return useApi(
    () => plotTwistService.getQuestById(questId),
    [questId],
    { ...options, autoFetch: !!questId }
  );
};

/**
 * Hook to fetch Plot Twist characters
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const usePlotTwistCharacters = (options = {}) => {
  return useApi(
    () => plotTwistService.getCharacters(),
    [],
    options
  );
};

/**
 * Hook to fetch Plot Twist response options
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const usePlotTwistResponseOptions = (options = {}) => {
  return useApi(
    () => plotTwistService.getResponseOptions(),
    [],
    options
  );
};

/**
 * Hook for Plot Twist quest mutations (create/update/delete)
 * @param {Object} options - Mutation options
 * @returns {{ createQuest: Function; updateQuest: Function; deleteQuest: Function; loading: boolean; error: string | null }}
 */
export const usePlotTwistQuestMutation = (options = {}) => {
  const createMutation = useMutation(
    (data) => plotTwistService.createQuest(data),
    {
      successMessage: 'Plot Twist quest created successfully',
      ...options,
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => plotTwistService.updateQuest(id, data),
    {
      successMessage: 'Plot Twist quest updated successfully',
      ...options,
    }
  );

  const deleteMutation = useMutation(
    (id) => plotTwistService.deleteQuest(id),
    {
      successMessage: 'Plot Twist quest deleted successfully',
      ...options,
    }
  );

  return {
    createQuest: createMutation.mutate,
    updateQuest: updateMutation.mutate,
    deleteQuest: deleteMutation.mutate,
    loading: createMutation.loading || updateMutation.loading || deleteMutation.loading,
    error: createMutation.error || updateMutation.error || deleteMutation.error,
  };
};

export default {
  usePlotTwistQuests,
  usePlotTwistQuest,
  usePlotTwistCharacters,
  usePlotTwistResponseOptions,
  usePlotTwistQuestMutation,
};

