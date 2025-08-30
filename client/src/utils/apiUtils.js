/**
 * Centralized API Utilities for Smart Task Manager
 * Provides consistent error handling, dynamic URL generation, and smart retry logic
 */

// Dynamic API URL generator that works across different environments
export const getApiUrl = (endpoint) => {
  // Check if we're in production and have a Railway API URL
  const productionApiUrl = import.meta.env.VITE_API_URL;
  
  if (productionApiUrl && import.meta.env.PROD) {
    // Production: use Railway backend URL
    return `${productionApiUrl}/api${endpoint}`;
  } else {
    // Development: use relative URLs to leverage Vite's proxy
    return `/api${endpoint}`;
  }
};

// Centralized error handler
export const handleApiError = (error, context = 'API Call') => {
  console.error(`API Error in ${context}:`, error);
  
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return { 
      type: 'network', 
      message: 'Network connection issue. Please check your connection.',
      severity: 'warning'
    };
  }
  
  // CORS errors
  if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
    return { 
      type: 'cors', 
      message: 'Cross-origin request blocked. Please check server configuration.',
      severity: 'error'
    };
  }
  
  // Authentication errors
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    // Clear auth data and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
    return { 
      type: 'auth', 
      message: 'Session expired. Please log in again.',
      severity: 'error'
    };
  }
  
  // Server errors
  if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
    return { 
      type: 'server', 
      message: 'Server error. Please try again later.',
      severity: 'error'
    };
  }
  
  // Not found errors
  if (error.message.includes('404') || error.message.includes('Not Found')) {
    return { 
      type: 'notFound', 
      message: 'Resource not found.',
      severity: 'warning'
    };
  }
  
  // Generic error
  return { 
    type: 'general', 
    message: 'An error occurred. Please try again.',
    severity: 'error'
  };
};

// Smart API call with retry logic and error handling
export const smartApiCall = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
    retries = 2,
    retryDelay = 1000,
    signal = null
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const url = getApiUrl(endpoint);
      
      const requestOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        signal
      };

      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
      }

      // Add auth token if available
      const token = localStorage.getItem('token');
      if (token) {
        requestOptions.headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.name === 'AbortError' || 
          error.message.includes('401') || 
          error.message.includes('403') ||
          error.message.includes('404')) {
        break;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// API call with automatic error handling
export const apiCall = async (endpoint, options = {}) => {
  try {
    return await smartApiCall(endpoint, options);
  } catch (error) {
    const errorInfo = handleApiError(error, `API Call to ${endpoint}`);
    throw new Error(errorInfo.message);
  }
};

// Batch API calls with error handling
export const batchApiCall = async (endpoints, options = {}) => {
  const promises = endpoints.map(endpoint => 
    smartApiCall(endpoint, options).catch(error => {
      const errorInfo = handleApiError(error, `Batch API Call to ${endpoint}`);
      return { error: errorInfo, endpoint };
    })
  );
  
  const results = await Promise.allSettled(promises);
  
  const successful = [];
  const failed = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && !result.value.error) {
      successful.push({ endpoint: endpoints[index], data: result.value });
    } else {
      failed.push({ 
        endpoint: endpoints[index], 
        error: result.value?.error || result.reason 
      });
    }
  });
  
  return { successful, failed };
};

// Polling configuration presets
export const POLLING_CONFIGS = {
  FREQUENT: { baseInterval: 30000, maxRetries: 3, maxInterval: 2 * 60 * 1000 }, // 30s base, max 2min
  NORMAL: { baseInterval: 60 * 1000, maxRetries: 3, maxInterval: 5 * 60 * 1000 }, // 1min base, max 5min
  INFREQUENT: { baseInterval: 5 * 60 * 1000, maxRetries: 2, maxInterval: 15 * 60 * 1000 }, // 5min base, max 15min
  RARE: { baseInterval: 15 * 60 * 1000, maxRetries: 2, maxInterval: 30 * 60 * 1000 } // 15min base, max 30min
};

// Utility to check if user is online
export const isOnline = () => {
  return navigator.onLine;
};

// Utility to add online/offline event listeners
export const setupNetworkListeners = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}; 