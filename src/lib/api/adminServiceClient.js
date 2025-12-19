/**
 * Admin Service API Client
 * Centralized axios instance for admin-service microservice with interceptors
 */

import axios from 'axios';
import { ADMIN_SERVICE_CONFIG } from './adminServiceConfig';
import { getErrorMessage } from '@/utils/apiHelpers';

// Create axios instance with base configuration
const adminServiceClient = axios.create({
  baseURL: ADMIN_SERVICE_CONFIG.baseURL,
  timeout: ADMIN_SERVICE_CONFIG.timeout,
  headers: ADMIN_SERVICE_CONFIG.headers,
});

/**
 * Request Interceptor
 * Add authentication tokens, modify requests before they are sent
 */
adminServiceClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (for future use)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Admin Service Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
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
    console.error('[Admin Service Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle responses, transform data, handle errors globally
 */
adminServiceClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Admin Service Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    // Return response (services will extract data)
    return response;
  },
  (error) => {
    // Handle response errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`[Admin Service Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
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
      console.error('[Admin Service Network Error]', {
        request: error.request,
        config: error.config,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown'
      });
      
      const networkError = {
        ...error,
        status: 0,
        message: 'Network error. Please check your connection and admin-service availability.',
        isNetworkError: true,
      };

      return Promise.reject(networkError);
    } else {
      // Something else happened
      console.error('[Admin Service Error]', error.message);
      return Promise.reject(error);
    }
  }
);

export default adminServiceClient;

