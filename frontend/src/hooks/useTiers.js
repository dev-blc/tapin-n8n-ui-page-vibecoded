/**
 * Tier Hooks
 * React hooks for tier-related API operations
 */

import plotTwistService from '@/services/api/plotTwistService';
import { useApi } from './useApi';

/**
 * Hook to fetch all awareness tiers
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useTiers = (options = {}) => {
  return useApi(
    () => plotTwistService.getTiers(),
    [],
    options
  );
};

export default { useTiers };
