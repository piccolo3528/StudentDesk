import { useState, useCallback } from 'react';
import { apiClient } from '../utils/api';

/**
 * Custom hook to handle API requests with loading and error states
 * @returns {Object} API methods, loading state, and error state
 */
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Executes an API request with loading and error handling
   * @param {Function} apiCall - Function that returns a promise (e.g., () => apiClient.get('/endpoint'))
   * @param {Function} onSuccess - Optional callback for success handling
   * @param {Function} onError - Optional callback for error handling
   * @returns {Promise} The result of the API call
   */
  const execute = useCallback(async (apiCall, onSuccess, onError) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      return response.data;
    } catch (err) {
      console.error('API request failed:', err);
      
      setError({
        message: err.displayMessage || 'Request failed',
        statusCode: err.status || 500,
        details: err.data,
        endpoint: err.endpoint,
      });
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * GET request wrapper
   * @param {string} endpoint - API endpoint
   * @param {Object} params - URL parameters
   * @param {Object} options - Additional axios options
   * @returns {Promise} The result of the API call
   */
  const get = useCallback((endpoint, params, options = {}) => {
    return execute(() => apiClient.get(endpoint, { params, ...options }));
  }, [execute]);

  /**
   * POST request wrapper
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional axios options
   * @returns {Promise} The result of the API call
   */
  const post = useCallback((endpoint, data, options = {}) => {
    return execute(() => apiClient.post(endpoint, data, options));
  }, [execute]);

  /**
   * PUT request wrapper
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional axios options
   * @returns {Promise} The result of the API call
   */
  const put = useCallback((endpoint, data, options = {}) => {
    return execute(() => apiClient.put(endpoint, data, options));
  }, [execute]);

  /**
   * PATCH request wrapper
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional axios options
   * @returns {Promise} The result of the API call
   */
  const patch = useCallback((endpoint, data, options = {}) => {
    return execute(() => apiClient.patch(endpoint, data, options));
  }, [execute]);

  /**
   * DELETE request wrapper
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional axios options
   * @returns {Promise} The result of the API call
   */
  const del = useCallback((endpoint, options = {}) => {
    return execute(() => apiClient.delete(endpoint, options));
  }, [execute]);

  /**
   * Clear current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    execute,
    get,
    post,
    put,
    patch,
    del,
  };
};

export default useApi; 