/**
 * Content Hooks
 * React hooks for content-related API operations (QuickShift, PlotTwist, Templates)
 */

import { useApi, useMutation } from './useApi';
import quickShiftService from '@/services/api/quickShiftService';
import plotTwistService from '@/services/api/plotTwistService';
import templateService from '@/services/api/templateService';

// Quick Shift Hooks
export const useQuickShiftLoops = (params = {}, options = {}) => {
  return useApi(
    () => quickShiftService.getLoops(params),
    [JSON.stringify(params)],
    options
  );
};

export const useQuickShiftReframes = (params = {}, options = {}) => {
  return useApi(
    () => quickShiftService.getReframes(params),
    [JSON.stringify(params)],
    options
  );
};

export const useQuickShiftProtectors = (params = {}, options = {}) => {
  return useApi(
    () => quickShiftService.getProtectors(params),
    [JSON.stringify(params)],
    options
  );
};

export const useQuickShiftMutations = (options = {}) => {
  const createLoop = useMutation(
    (data) => quickShiftService.createLoop(data),
    { successMessage: 'Loop created successfully', ...options }
  );

  const createReframe = useMutation(
    (data) => quickShiftService.createReframe(data),
    { successMessage: 'Reframe created successfully', ...options }
  );

  const createProtector = useMutation(
    (data) => quickShiftService.createProtector(data),
    { successMessage: 'Protector created successfully', ...options }
  );

  return {
    createLoop: createLoop.mutate,
    createReframe: createReframe.mutate,
    createProtector: createProtector.mutate,
    loading: createLoop.loading || createReframe.loading || createProtector.loading,
  };
};

// Plot Twist Hooks
export const usePlotTwistQuests = (params = {}, options = {}) => {
  return useApi(
    () => plotTwistService.getQuests(params),
    [JSON.stringify(params)],
    options
  );
};

export const usePlotTwistCharacters = (options = {}) => {
  return useApi(
    () => plotTwistService.getCharacters(),
    [],
    options
  );
};

export const usePlotTwistResponseOptions = (options = {}) => {
  return useApi(
    () => plotTwistService.getResponseOptions(),
    [],
    options
  );
};

export const usePlotTwistMutations = (options = {}) => {
  const createQuest = useMutation(
    (data) => plotTwistService.createQuest(data),
    { successMessage: 'Quest created successfully', ...options }
  );

  return {
    createQuest: createQuest.mutate,
    loading: createQuest.loading,
  };
};

// Template Hooks
export const useAffirmationTemplates = (params = {}, options = {}) => {
  return useApi(
    () => templateService.getAffirmationTemplates(params),
    [JSON.stringify(params)],
    options
  );
};

export const useMeditationTemplates = (params = {}, options = {}) => {
  return useApi(
    () => templateService.getMeditationTemplates(params),
    [JSON.stringify(params)],
    options
  );
};

export const useTemplateMutations = (options = {}) => {
  const createAffirmation = useMutation(
    (data) => templateService.createAffirmationTemplate(data),
    { successMessage: 'Affirmation template created successfully', ...options }
  );

  const createMeditation = useMutation(
    (data) => templateService.createMeditationTemplate(data),
    { successMessage: 'Meditation template created successfully', ...options }
  );

  return {
    createAffirmation: createAffirmation.mutate,
    createMeditation: createMeditation.mutate,
    loading: createAffirmation.loading || createMeditation.loading,
  };
};

export default {};

