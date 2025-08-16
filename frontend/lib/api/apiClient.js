import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for authentication
});

// Token management utilities
const tokenManager = {
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },
  
  setAccessToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  },
  
  removeAccessToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  },
  
  getRefreshToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },
  
  setRefreshToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  },
  
  removeRefreshToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken');
    }
  },
  
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
};

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          const { accessToken } = response.data.data;
          tokenManager.setAccessToken(accessToken);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Retry logic for network errors
const retryRequest = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      await delay(1000); // Wait 1 second before retry
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};

// Check if error is retryable
const isRetryableError = (error) => {
  return (
    !error.response || // Network error
    error.response.status >= 500 || // Server error
    error.code === 'ECONNABORTED' // Timeout
  );
};

// Utility function for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced API client with retry logic
const apiClientWithRetry = {
  get: (url, config) => retryRequest(() => apiClient.get(url, config)),
  post: (url, data, config) => retryRequest(() => apiClient.post(url, data, config)),
  put: (url, data, config) => retryRequest(() => apiClient.put(url, data, config)),
  patch: (url, data, config) => retryRequest(() => apiClient.patch(url, data, config)),
  delete: (url, config) => retryRequest(() => apiClient.delete(url, config)),
};

// Error handling utilities
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      message: data.message || data.error || 'An error occurred',
      status,
      data: data.data || null
    };
  } else if (error.request) {
    // Network error
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      data: null
    };
  } else {
    // Other error
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      data: null
    };
  }
};

// Success response handler
export const handleApiResponse = (response) => {
  return {
    success: true,
    data: response.data.data || response.data,
    message: response.data.message || null
  };
};

export { apiClient, apiClientWithRetry, tokenManager };
export default apiClientWithRetry;