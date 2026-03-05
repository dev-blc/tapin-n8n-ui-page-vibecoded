/**
 * Analytics Service API Client
 * Centralized axios instance for the Railway analytics edge function
 */

import { getErrorMessage } from '@/utils/apiHelpers';
import axios from 'axios';
import { ANALYTICS_SERVICE_CONFIG } from './adminServiceConfig';

const analyticsServiceClient = axios.create({
  baseURL: ANALYTICS_SERVICE_CONFIG.baseURL,
  timeout: ANALYTICS_SERVICE_CONFIG.timeout,
  headers: ANALYTICS_SERVICE_CONFIG.headers,
});

analyticsServiceClient.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

analyticsServiceClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status || 0;
    const message = getErrorMessage(error);
    
    return Promise.reject({
      ...error,
      status,
      message,
      data: error.response?.data || {},
    });
  }
);

export default analyticsServiceClient;
