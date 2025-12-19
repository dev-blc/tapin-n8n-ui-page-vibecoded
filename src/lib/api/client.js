/**
 * API Client
 * Centralized axios instance with interceptors for request/response handling
 */

import axios from 'axios';
import { API_CONFIG } from './config';
import { getErrorMessage, isApiError } from '@/utils/apiHelpers';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

/**
 * Request Interceptor
 * Add authentication tokens, modify requests before they are sent
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (for future use)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
        baseURL: config.baseURL,
        url: config.url,
        fullURL: `${config.baseURL}${config.url}`,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    // Handle request error
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle responses, transform data, handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    // Return data directly (assuming API returns data in response.data)
    return response;
  },
  (error) => {
    // Handle response errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status,
          data,
        });
      }

      // Transform error to have consistent structure
      const apiError = {
        ...error,
        status,
        message: getErrorMessage(error),
        data: data || {},
      };

      return Promise.reject(apiError);
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API Network Error]', {
        request: error.request,
        config: error.config,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown'
      });
      
      const networkError = {
        ...error,
        status: 0,
        message: 'Network error. Please check your connection and API server availability.',
        isNetworkError: true,
      };

      return Promise.reject(networkError);
    } else {
      // Something else happened
      console.error('[API Error]', error.message);
      return Promise.reject(error);
    }
  }
);

export default apiClient;

