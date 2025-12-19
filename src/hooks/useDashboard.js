/**
 * Dashboard Hooks
 * React hooks for dashboard-related API operations
 */

import { useApi } from './useApi';
import dashboardService from '@/services/api/dashboardService';

/**
 * Hook to fetch dashboard statistics
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useDashboardStats = (options = {}) => {
  return useApi(
    () => dashboardService.getStats(),
    [],
    options
  );
};

/**
 * Hook to fetch recent activity
 * @param {Object} params - Query parameters (limit, etc.)
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useRecentActivity = (params = {}, options = {}) => {
  return useApi(
    () => dashboardService.getRecentActivity(params),
    [JSON.stringify(params)],
    { showErrorToast: true, ...options }
  );
};

/**
 * Hook to fetch content health metrics
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useContentHealth = (options = {}) => {
  return useApi(
    () => dashboardService.getContentHealth(),
    [],
    { showErrorToast: true, ...options }
  );
};

export default { useDashboardStats, useRecentActivity, useContentHealth };

