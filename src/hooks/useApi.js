/**
 * Generic API Hooks
 * Reusable hooks for API calls with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/apiHelpers';

/**
 * Generic API hook with loading and error states
 * @param {Function} apiCall - Async function to call
 * @param {Array} deps - Dependencies array (like useEffect)
 * @param {Object} options - Options
 * @param {boolean} options.autoFetch - Whether to fetch automatically on mount
 * @param {boolean} options.showErrorToast - Whether to show error toast
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useApi = (apiCall, deps = [], options = {}) => {
  const { autoFetch = true, showErrorToast = true } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      // Ensure arrays are never null - return empty array if result is null/undefined for array endpoints
      setData(result ?? null);
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      // Set data to empty array for array endpoints on error to prevent null reduce errors
      setData([]);
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, showErrorToast]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

/**
 * Mutation hook for create/update/delete operations
 * @param {Function} mutationFn - Mutation function
 * @param {Object} options - Options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {boolean} options.showSuccessToast - Whether to show success toast
 * @param {boolean} options.showErrorToast - Whether to show error toast
 * @returns {{ mutate: Function; loading: boolean; error: string | null }}
 */
export const useMutation = (mutationFn, options = {}) => {
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (data, customOptions = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn(data);
      
      if (showSuccessToast && customOptions.showSuccessToast !== false) {
        toast.success(customOptions.successMessage || successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result, data);
      }
      
      if (customOptions.onSuccess) {
        customOptions.onSuccess(result, data);
      }
      
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      if (showErrorToast && customOptions.showErrorToast !== false) {
        toast.error(errorMessage);
      }
      
      if (onError) {
        onError(err, data);
      }
      
      if (customOptions.onError) {
        customOptions.onError(err, data);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, onSuccess, onError, showSuccessToast, showErrorToast, successMessage]);

  return {
    mutate,
    loading,
    error,
  };
};

export default { useApi, useMutation };

