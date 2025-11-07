/**
 * Query Builder Utilities
 * Functions to build query strings and filter parameters for API requests
 */

/**
 * Builds a query string from an object of parameters
 * @param {Object} params - Parameters object
 * @returns {string} Query string (without leading ?)
 */
export const buildQueryString = (params) => {
  if (!params || typeof params !== 'object') return '';

  const queryParts = [];

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        // Handle array parameters (e.g., ?tiers=1&tiers=2)
        value.forEach(item => {
          queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
        });
      } else {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
  });

  return queryParts.join('&');
};

/**
 * Builds filter parameters object from UI filter state
 * @param {Object} filters - Filter object from UI
 * @returns {Object} API-compatible filter parameters
 */
export const buildFilterParams = (filters) => {
  const params = {};

  if (filters.search) {
    params.search = filters.search;
  }

  if (filters.status && filters.status !== 'all') {
    params.status = filters.status;
  }

  if (filters.tier && filters.tier !== 'all') {
    params.tier = filters.tier;
  }

  if (filters.character && filters.character !== 'all') {
    params.character = filters.character;
  }

  if (filters.dateFrom) {
    params.dateFrom = filters.dateFrom;
  }

  if (filters.dateTo) {
    params.dateTo = filters.dateTo;
  }

  if (filters.tiers && Array.isArray(filters.tiers)) {
    params.tiers = filters.tiers;
  }

  return params;
};

/**
 * Builds pagination parameters
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} Pagination parameters
 */
export const buildPaginationParams = (page = 1, limit = 10) => {
  return {
    page: Math.max(1, page),
    limit: Math.max(1, Math.min(100, limit)), // Cap at 100
  };
};

/**
 * Builds sort parameters
 * @param {string} field - Field to sort by
 * @param {'asc'|'desc'} order - Sort order
 * @returns {Object} Sort parameters
 */
export const buildSortParams = (field, order = 'asc') => {
  if (!field) return {};
  
  return {
    sortBy: field,
    sortOrder: order,
  };
};

/**
 * Combines multiple parameter objects into a single query string
 * @param {...Object} paramObjects - Parameter objects to combine
 * @returns {string} Combined query string
 */
export const combineQueryParams = (...paramObjects) => {
  const combined = {};
  
  paramObjects.forEach(params => {
    if (params && typeof params === 'object') {
      Object.assign(combined, params);
    }
  });
  
  return buildQueryString(combined);
};

/**
 * Appends query string to a URL
 * @param {string} url - Base URL
 * @param {Object|string} params - Parameters object or query string
 * @returns {string} URL with query string
 */
export const appendQueryString = (url, params) => {
  if (!params) return url;
  
  const queryString = typeof params === 'string' 
    ? params 
    : buildQueryString(params);
  
  if (!queryString) return url;
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${queryString}`;
};

export default {};

