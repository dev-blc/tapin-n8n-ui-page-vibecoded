/**
 * Base API Service
 * Generic CRUD operations and common API functionality
 */

import localBackendClient from '@/lib/api/localBackendClient';
import { handleApiError, retryRequest, isRetryableError } from '@/utils/apiHelpers';

/**
 * Base API Service Class
 * Provides common CRUD operations and error handling
 */
class BaseService {
  /**
   * @param {string} baseEndpoint - Base endpoint path for this service
   * @param {Object} [client] - Axios client instance (defaults to localBackendClient)
   */
  constructor(baseEndpoint, client = localBackendClient) {
    this.baseEndpoint = baseEndpoint;
    this.client = client;
  }

  /**
   * Generic GET request
   * @param {string} endpoint - Endpoint path (relative to baseEndpoint)
   * @param {Object} [params] - Query parameters
   * @param {Object} [config] - Additional axios config
   * @returns {Promise<any>}
   */
  async get(endpoint = '', params = {}, config = {}) {
    try {
      const url = endpoint ? `${this.baseEndpoint}${endpoint}` : this.baseEndpoint;
      const response = await this.client.get(url, { params, ...config });
      return response.data;
    } catch (error) {
      if (isRetryableError(error)) {
        return retryRequest(() => this.get(endpoint, params, config));
      }
      throw handleApiError(error);
    }
  }

  /**
   * Generic POST request
   * @param {string} endpoint - Endpoint path (relative to baseEndpoint)
   * @param {Object} data - Request body data
   * @param {Object} [config] - Additional axios config
   * @returns {Promise<any>}
   */
  async post(endpoint = '', data = {}, config = {}) {
    try {
      const url = endpoint ? `${this.baseEndpoint}${endpoint}` : this.baseEndpoint;
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      if (isRetryableError(error)) {
        return retryRequest(() => this.post(endpoint, data, config));
      }
      throw handleApiError(error);
    }
  }

  /**
   * Generic PUT request
   * @param {string} endpoint - Endpoint path (relative to baseEndpoint)
   * @param {Object} data - Request body data
   * @param {Object} [config] - Additional axios config
   * @returns {Promise<any>}
   */
  async put(endpoint = '', data = {}, config = {}) {
    try {
      const url = endpoint ? `${this.baseEndpoint}${endpoint}` : this.baseEndpoint;
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      if (isRetryableError(error)) {
        return retryRequest(() => this.put(endpoint, data, config));
      }
      throw handleApiError(error);
    }
  }

  /**
   * Generic PATCH request
   * @param {string} endpoint - Endpoint path (relative to baseEndpoint)
   * @param {Object} data - Request body data
   * @param {Object} [config] - Additional axios config
   * @returns {Promise<any>}
   */
  async patch(endpoint = '', data = {}, config = {}) {
    try {
      const url = endpoint ? `${this.baseEndpoint}${endpoint}` : this.baseEndpoint;
      const response = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      if (isRetryableError(error)) {
        return retryRequest(() => this.patch(endpoint, data, config));
      }
      throw handleApiError(error);
    }
  }

  /**
   * Generic DELETE request
   * @param {string} endpoint - Endpoint path (relative to baseEndpoint)
   * @param {Object} [config] - Additional axios config
   * @returns {Promise<any>}
   */
  async delete(endpoint = '', config = {}) {
    try {
      const url = endpoint ? `${this.baseEndpoint}${endpoint}` : this.baseEndpoint;
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      if (isRetryableError(error)) {
        return retryRequest(() => this.delete(endpoint, config));
      }
      throw handleApiError(error);
    }
  }

  /**
   * Get all items (with optional filters)
   * @param {Object} [params] - Query parameters (filters, pagination, etc.)
   * @returns {Promise<any>}
   */
  async getAll(params = {}) {
    return this.get('', params);
  }

  /**
   * Get item by ID
   * @param {string|number} id - Item ID
   * @param {Object} [params] - Additional query parameters
   * @returns {Promise<any>}
   */
  async getById(id, params = {}) {
    return this.get(`/${id}`, params);
  }

  /**
   * Create new item
   * @param {Object} data - Item data
   * @returns {Promise<any>}
   */
  async create(data) {
    return this.post('', data);
  }

  /**
   * Update item by ID
   * @param {string|number} id - Item ID
   * @param {Object} data - Updated item data
   * @returns {Promise<any>}
   */
  async update(id, data) {
    return this.put(`/${id}`, data);
  }

  /**
   * Partially update item by ID
   * @param {string|number} id - Item ID
   * @param {Object} data - Partial item data
   * @returns {Promise<any>}
   */
  async patchUpdate(id, data) {
    return this.patch(`/${id}`, data);
  }

  /**
   * Delete item by ID
   * @param {string|number} id - Item ID
   * @returns {Promise<any>}
   */
  async deleteById(id) {
    return this.delete(`/${id}`);
  }
}

export default BaseService;

