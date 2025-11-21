/**
 * Quick Shift Hooks
 * React hooks for Quick Shift-related API operations
 */

import { useApi, useMutation } from './useApi';
import quickShiftService from '@/services/api/quickShiftService';

/**
 * Hook to fetch all Quick Shift loops
 * @param {Object} options - Hook options
 * @param {Object} options.params - Query parameters (tier, category, etc.)
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useQuickShiftLoops = (options = {}) => {
  const { params = {}, ...restOptions } = options;
  return useApi(
    () => quickShiftService.getLoops(params),
    [JSON.stringify(params)],
    restOptions
  );
};

/**
 * Hook to fetch a single Quick Shift loop by ID
 * @param {string} loopId - Loop ID
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useQuickShiftLoop = (loopId, options = {}) => {
  return useApi(
    () => quickShiftService.getLoopById(loopId),
    [loopId],
    { ...options, autoFetch: !!loopId }
  );
};

/**
 * Hook to fetch all Quick Shift reframes
 * @param {Object} options - Hook options
 * @param {Object} options.params - Query parameters (tier, category, etc.)
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useQuickShiftReframes = (options = {}) => {
  const { params = {}, ...restOptions } = options;
  return useApi(
    () => quickShiftService.getReframes(params),
    [JSON.stringify(params)],
    restOptions
  );
};

/**
 * Hook to fetch a single Quick Shift reframe by ID
 * @param {string} reframeId - Reframe ID
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useQuickShiftReframe = (reframeId, options = {}) => {
  return useApi(
    () => quickShiftService.getReframeById(reframeId),
    [reframeId],
    { ...options, autoFetch: !!reframeId }
  );
};

/**
 * Hook to fetch all Quick Shift protectors
 * @param {Object} options - Hook options
 * @param {Object} options.params - Query parameters
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useQuickShiftProtectors = (options = {}) => {
  const { params = {}, ...restOptions } = options;
  return useApi(
    () => quickShiftService.getProtectors(params),
    [JSON.stringify(params)],
    restOptions
  );
};

/**
 * Hook to fetch a single Quick Shift protector by ID
 * @param {string} protectorId - Protector ID
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useQuickShiftProtector = (protectorId, options = {}) => {
  return useApi(
    () => quickShiftService.getProtectorById(protectorId),
    [protectorId],
    { ...options, autoFetch: !!protectorId }
  );
};

/**
 * Hook for Quick Shift loop mutations (create/update/delete)
 * @param {Object} options - Mutation options
 * @returns {{ createLoop: Function; updateLoop: Function; deleteLoop: Function; loading: boolean; error: string | null }}
 */
export const useQuickShiftLoopMutation = (options = {}) => {
  const createMutation = useMutation(
    (data) => quickShiftService.createLoop(data),
    {
      successMessage: 'Quick Shift loop created successfully',
      ...options,
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => quickShiftService.updateLoop(id, data),
    {
      successMessage: 'Quick Shift loop updated successfully',
      ...options,
    }
  );

  const deleteMutation = useMutation(
    (id) => quickShiftService.deleteLoop(id),
    {
      successMessage: 'Quick Shift loop deleted successfully',
      ...options,
    }
  );

  return {
    createLoop: createMutation.mutate,
    updateLoop: updateMutation.mutate,
    deleteLoop: deleteMutation.mutate,
    loading: createMutation.loading || updateMutation.loading || deleteMutation.loading,
    error: createMutation.error || updateMutation.error || deleteMutation.error,
  };
};

/**
 * Hook for Quick Shift reframe mutations (create/update/delete)
 * @param {Object} options - Mutation options
 * @returns {{ createReframe: Function; updateReframe: Function; deleteReframe: Function; loading: boolean; error: string | null }}
 */
export const useQuickShiftReframeMutation = (options = {}) => {
  const createMutation = useMutation(
    (data) => quickShiftService.createReframe(data),
    {
      successMessage: 'Quick Shift reframe created successfully',
      ...options,
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => quickShiftService.updateReframe(id, data),
    {
      successMessage: 'Quick Shift reframe updated successfully',
      ...options,
    }
  );

  const deleteMutation = useMutation(
    (id) => quickShiftService.deleteReframe(id),
    {
      successMessage: 'Quick Shift reframe deleted successfully',
      ...options,
    }
  );

  return {
    createReframe: createMutation.mutate,
    updateReframe: updateMutation.mutate,
    deleteReframe: deleteMutation.mutate,
    loading: createMutation.loading || updateMutation.loading || deleteMutation.loading,
    error: createMutation.error || updateMutation.error || deleteMutation.error,
  };
};

/**
 * Hook for Quick Shift protector mutations (create/update/delete)
 * @param {Object} options - Mutation options
 * @returns {{ createProtector: Function; updateProtector: Function; deleteProtector: Function; loading: boolean; error: string | null }}
 */
export const useQuickShiftProtectorMutation = (options = {}) => {
  const createMutation = useMutation(
    (data) => quickShiftService.createProtector(data),
    {
      successMessage: 'Quick Shift protector created successfully',
      ...options,
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => quickShiftService.updateProtector(id, data),
    {
      successMessage: 'Quick Shift protector updated successfully',
      ...options,
    }
  );

  const deleteMutation = useMutation(
    (id) => quickShiftService.deleteProtector(id),
    {
      successMessage: 'Quick Shift protector deleted successfully',
      ...options,
    }
  );

  return {
    createProtector: createMutation.mutate,
    updateProtector: updateMutation.mutate,
    deleteProtector: deleteMutation.mutate,
    loading: createMutation.loading || updateMutation.loading || deleteMutation.loading,
    error: createMutation.error || updateMutation.error || deleteMutation.error,
  };
};

export default {
  useQuickShiftLoops,
  useQuickShiftLoop,
  useQuickShiftReframes,
  useQuickShiftReframe,
  useQuickShiftProtectors,
  useQuickShiftProtector,
  useQuickShiftLoopMutation,
  useQuickShiftReframeMutation,
  useQuickShiftProtectorMutation,
};

