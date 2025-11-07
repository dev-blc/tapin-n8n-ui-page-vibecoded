/**
 * Local Backend API Client
 * Centralized axios instance for local backend API with interceptors
 */

import axios from 'axios';
import { LOCAL_BACKEND_CONFIG } from './localBackendConfig';
import { getErrorMessage } from '@/utils/apiHelpers';

// Create axios instance with base configuration
const localBackendClient = axios.create({
  baseURL: LOCAL_BACKEND_CONFIG.baseURL,
  timeout: LOCAL_BACKEND_CONFIG.timeout,
  headers: LOCAL_BACKEND_CONFIG.headers,
});

/**
 * Request Interceptor
 * Add authentication tokens, modify requests before they are sent
 */
localBackendClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (for future use)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Local Backend Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
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
    console.error('[Local Backend Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle responses, transform data, handle errors globally
 */
localBackendClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Local Backend Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
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
        console.error(`[Local Backend Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
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
      console.error('[Local Backend Network Error]', {
        request: error.request,
        config: error.config,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown'
      });
      
      const networkError = {
        ...error,
        status: 0,
        message: 'Local backend is not available. Please ensure the backend server is running on http://localhost:8001',
        isNetworkError: true,
      };

      return Promise.reject(networkError);
    } else {
      // Something else happened
      console.error('[Local Backend Error]', error.message);
      return Promise.reject(error);
    }
  }
);

export default localBackendClient;

