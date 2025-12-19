/**
 * User Hooks
 * React hooks for user-related API operations
 */

import { useState, useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import userService from '@/services/api/userService';

/**
 * Hook to fetch users with filters
 * @param {Object} filters - Filter parameters
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useUsers = (filters = {}, options = {}) => {
  return useApi(
    () => userService.getUsers(filters),
    [JSON.stringify(filters)],
    options
  );
};

/**
 * Hook to fetch a single user by ID
 * @param {string} userId - User ID
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useUser = (userId, options = {}) => {
  return useApi(
    () => userService.getUserById(userId),
    [userId],
    { ...options, autoFetch: !!userId }
  );
};

/**
 * Hook to fetch user engagement metrics
 * @param {string} userId - User ID
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useUserEngagement = (userId, options = {}) => {
  return useApi(
    () => userService.getUserEngagement(userId),
    [userId],
    { ...options, autoFetch: !!userId }
  );
};

/**
 * Hook to fetch user activity
 * @param {string} userId - User ID
 * @param {Object} params - Query parameters
 * @param {Object} options - Hook options
 * @returns {{ data: any; loading: boolean; error: string | null; refetch: Function }}
 */
export const useUserActivity = (userId, params = {}, options = {}) => {
  return useApi(
    () => userService.getUserActivity(userId, params),
    [userId, JSON.stringify(params)],
    { ...options, autoFetch: !!userId }
  );
};

/**
 * Hook for user mutations (create/update)
 * @param {Object} options - Mutation options
 * @returns {{ mutate: Function; loading: boolean; error: string | null }}
 */
export const useUserMutation = (options = {}) => {
  const updateMutation = useMutation(
    async (data) => {
      if (data.id) {
        return userService.updateUser(data.id, data);
      }
      throw new Error('User ID is required for update');
    },
    {
      successMessage: 'User updated successfully',
      ...options,
    }
  );

  return updateMutation;
};

export default { useUsers, useUser, useUserEngagement, useUserActivity, useUserMutation };

