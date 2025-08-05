import axios from 'axios';
import logger from './logger';

// Create a safe logger that won't crash if the logger module fails to load
const safeLogger = {
  debug: (message, data) => {
    if (logger && typeof logger.debug === 'function') {
      logger.debug(message, data);
    } else {
      console.debug('[FALLBACK]', message, data);
    }
  },
  info: (message, data) => {
    if (logger && typeof logger.info === 'function') {
      logger.info(message, data);
    } else {
      console.info('[FALLBACK]', message, data);
    }
  },
  warn: (message, data) => {
    if (logger && typeof logger.warn === 'function') {
      logger.warn(message, data);
    } else {
      console.warn('[FALLBACK]', message, data);
    }
  },
  error: (message, error, additionalData) => {
    if (logger && typeof logger.error === 'function') {
      logger.error(message, error, additionalData);
    } else {
      console.error('[FALLBACK]', message, error, additionalData);
    }
  }
};

// Determine the correct base URL
const getBaseUrl = () => {
  // Check if we're running in development or production
  const isDev = process.env.NODE_ENV === 'development';
  
  // For development, we might need a relative path or specific URL
  // For production, we often use relative paths
  const baseUrl = isDev ? 'http://localhost:5000/api' : '/api';
  
  safeLogger.debug(`API Base URL set to: ${baseUrl}`);
  return baseUrl;
};

// Create API client instance
const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Set credentials mode for authentication
  withCredentials: false // Set to true if your API requires cookies
});

// Initialize API client with interceptors and error handling
const setupAPIClient = () => {
  // Request interceptor
  apiClient.interceptors.request.use(
    (config) => {
      // Add timestamp for debugging
      config.metadata = { startTime: new Date() };
      
      // Get token from localStorage and add to headers if it exists
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log request details
      safeLogger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, { 
        data: config.data,
        params: config.params
      });
      
      return config;
    },
    (error) => {
      safeLogger.error('API Request Error', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  apiClient.interceptors.response.use(
    (response) => {
      // Calculate request duration
      const requestDuration = calculateRequestDuration(response);
      
      safeLogger.debug(`API Response: ${response.config.url}`, { 
        status: response.status,
        duration: `${requestDuration}ms`,
        size: JSON.stringify(response.data).length
      });
      
      return response;
    },
    async (error) => {
      // Calculate request duration even for errors
      const requestDuration = calculateRequestDuration(error);
      
      // Handle no response or network errors
      if (!error.response) {
        safeLogger.error(`Network Error: ${error.config?.url}`, {
          message: error.message,
          duration: `${requestDuration}ms`,
          config: error.config
        });
        
        // Special handling for authentication endpoints during network errors
        const isAuthEndpoint = error.config?.url?.includes('/auth/');
        
        // Retry logic for network errors (except during authentication)
        if (error.config && !error.config._isRetry && !isAuthEndpoint) {
          return retryRequest(error);
        }
        
        const enhancedError = enhanceError(error, {
          displayMessage: 'Network error. Please check your connection.',
          status: 0,
          duration: requestDuration,
        });
        
        return Promise.reject(enhancedError);
      }
      
      // Check if it's an authentication endpoint for proper error handling
      const isAuthEndpoint = error.config.url.includes('/auth/');
      
      // For authentication endpoints, we want specific handling
      if (isAuthEndpoint) {
        safeLogger.warn(`Authentication Error: ${error.config.url}`, {
          status: error.response.status,
          message: error.response.data?.message || 'Authentication failed'
        });
        
        // Create auth-specific error
        const enhancedError = enhanceError(error, {
          displayMessage: error.response.data?.message || 'Authentication failed. Please check your credentials.',
          duration: requestDuration,
          isAuthError: true
        });
        
        return Promise.reject(enhancedError);
      }
      
      // Log error based on severity for non-auth endpoints
      const logMethod = error.response.status >= 500 ? 'error' : 'warn';
      safeLogger[logMethod](`API Error: ${error.config.url}`, {
        status: error.response.status,
        duration: `${requestDuration}ms`,
        data: error.response.data,
        method: error.config.method?.toUpperCase()
      });
      
      // Handle expired tokens and auth issues
      if (error.response.status === 401) {
        // Clear tokens
        localStorage.removeItem('token');
        
        // If we have a dedicated auth route, redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Retry for specific status codes (except auth endpoints)
      if (!isAuthEndpoint && (error.response.status === 408 || error.response.status === 500) && 
          error.config && !error.config._isRetry) {
        return retryRequest(error);
      }
      
      // Enhance the error with additional context
      const enhancedError = enhanceError(error, {
        displayMessage: getDisplayMessage(error),
        duration: requestDuration,
      });
      
      return Promise.reject(enhancedError);
    }
  );

  // Helper functions
  
  // Calculate request duration
  function calculateRequestDuration(response) {
    const startTime = response.config?.metadata?.startTime;
    return startTime ? new Date() - startTime : 0;
  }
  
  // Add additional properties to the error object
  function enhanceError(error, props) {
    // Clone the error to avoid mutating the original
    const enhancedError = { 
      ...error, 
      ...props,
      endpoint: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: props.status || error.response?.status,
      data: error.response?.data,
      isAxiosError: true,
    };
    
    return enhancedError;
  }
  
  // Get user-friendly error message
  function getDisplayMessage(error) {
    // Use server-provided message if available
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Provide friendly messages based on status code
    switch (error.response?.status) {
      case 400:
        return 'Invalid request. Please check your data.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'You do not have permission to access this resource.';
      case 404:
        return 'The requested resource was not found.';
      case 408:
        return 'Request timeout. Please try again.';
      case 409:
        return 'Conflict with current state of the resource.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Internal server error. Our team has been notified.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  
  // Retry the failed request after a delay
  async function retryRequest(error) {
    error.config._isRetry = true;
    
    // Wait for a second before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    safeLogger.info(`Retrying request: ${error.config.url}`);
    return apiClient(error.config);
  }
};

// Debug function to test API connectivity
const testApiConnection = async () => {
  try {
    const response = await apiClient.get('/health');
    safeLogger.info('API connection successful', {
      baseUrl: apiClient.defaults.baseURL,
      response: response.data
    });
    return {
      success: true,
      data: response.data
    };
  } catch (err) {
    safeLogger.error('API connection failed', {
      baseUrl: apiClient.defaults.baseURL,
      error: err.message
    });
    return {
      success: false,
      error: err
    };
  }
};

// Export both the client instance and the setup function
export { apiClient, setupAPIClient, testApiConnection }; 