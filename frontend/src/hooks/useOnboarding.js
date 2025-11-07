/**
 * Onboarding Hooks
 * React hooks for onboarding-related API operations
 */

import { useApi, useMutation } from './useApi';
import onboardingService from '@/services/api/onboardingService';

/**
 * Hook to fetch all onboarding questions
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useOnboardingQuestions = (options = {}) => {
  return useApi(
    () => onboardingService.getQuestions(),
    [],
    options
  );
};

/**
 * Hook to fetch a single question by ID
 * @param {string} questionId - Question ID
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useOnboardingQuestion = (questionId, options = {}) => {
  return useApi(
    () => onboardingService.getQuestionById(questionId),
    [questionId],
    { ...options, autoFetch: !!questionId }
  );
};

/**
 * Hook to fetch character mapping
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useCharacterMapping = (options = {}) => {
  return useApi(
    () => onboardingService.getCharacterMapping(),
    [],
    options
  );
};

/**
 * Hook for question mutations (create/update/delete)
 * @param {Object} options - Mutation options
 * @returns {{ createQuestion: Function; updateQuestion: Function; deleteQuestion: Function; loading: boolean; error: string | null }}
 */
export const useQuestionMutation = (options = {}) => {
  const createMutation = useMutation(
    (data) => onboardingService.createQuestion(data),
    {
      successMessage: 'Question created successfully',
      ...options,
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => onboardingService.updateQuestion(id, data),
    {
      successMessage: 'Question updated successfully',
      ...options,
    }
  );

  const deleteMutation = useMutation(
    (id) => onboardingService.deleteQuestion(id),
    {
      successMessage: 'Question deleted successfully',
      ...options,
    }
  );

  return {
    createQuestion: createMutation.mutate,
    updateQuestion: updateMutation.mutate,
    deleteQuestion: deleteMutation.mutate,
    loading: createMutation.loading || updateMutation.loading || deleteMutation.loading,
    error: createMutation.error || updateMutation.error || deleteMutation.error,
  };
};

/**
 * Hook for option mutations (create/update/delete)
 * @param {Object} options - Mutation options
 * @returns {{ createOption: Function; updateOption: Function; deleteOption: Function; loading: boolean; error: string | null }}
 */
export const useOptionMutation = (options = {}) => {
  const createMutation = useMutation(
    (data) => onboardingService.createOption(data),
    {
      successMessage: 'Option created successfully',
      ...options,
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => onboardingService.updateOption(id, data),
    {
      successMessage: 'Option updated successfully',
      ...options,
    }
  );

  const deleteMutation = useMutation(
    (id) => onboardingService.deleteOption(id),
    {
      successMessage: 'Option deleted successfully',
      ...options,
    }
  );

  return {
    createOption: createMutation.mutate,
    updateOption: updateMutation.mutate,
    deleteOption: deleteMutation.mutate,
    loading: createMutation.loading || updateMutation.loading || deleteMutation.loading,
    error: createMutation.error || updateMutation.error || deleteMutation.error,
  };
};

export default { useOnboardingQuestions, useOnboardingQuestion, useCharacterMapping, useQuestionMutation, useOptionMutation };

