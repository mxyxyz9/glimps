import apiClient, { handleApiError, handleApiResponse, tokenManager } from './apiClient';

// Authentication API client
export const authApi = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const result = handleApiResponse(response);
      
      // Store tokens if login successful
      if (result.success && result.data.accessToken) {
        tokenManager.setAccessToken(result.data.accessToken);
        if (result.data.refreshToken) {
          tokenManager.setRefreshToken(result.data.refreshToken);
        }
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const result = handleApiResponse(response);
      
      // Store tokens if registration successful
      if (result.success && result.data.accessToken) {
        tokenManager.setAccessToken(result.data.accessToken);
        if (result.data.refreshToken) {
          tokenManager.setRefreshToken(result.data.refreshToken);
        }
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      const result = handleApiResponse(response);
      
      // Clear tokens regardless of response
      tokenManager.clearTokens();
      
      return result;
    } catch (error) {
      // Clear tokens even if logout request fails
      tokenManager.clearTokens();
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh', {
        refreshToken
      });
      
      const result = handleApiResponse(response);
      
      // Update stored access token
      if (result.success && result.data.accessToken) {
        tokenManager.setAccessToken(result.data.accessToken);
        // Update refresh token if provided
        if (result.data.refreshToken) {
          tokenManager.setRefreshToken(result.data.refreshToken);
        }
      }
      
      return result;
    } catch (error) {
      // Clear tokens if refresh fails
      tokenManager.clearTokens();
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.put('/auth/password', passwordData);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Reset password with token
  resetPassword: async (resetData) => {
    try {
      const response = await apiClient.post('/auth/reset-password', resetData);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Delete user account
  deleteAccount: async () => {
    try {
      const response = await apiClient.delete('/auth/account');
      
      // Clear tokens regardless of response
      tokenManager.clearTokens();
      
      return handleApiResponse(response);
    } catch (error) {
      // Clear tokens even if delete request fails
      tokenManager.clearTokens();
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  }
};

// Authentication utilities
export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!tokenManager.getAccessToken();
  },

  // Get stored access token
  getAccessToken: () => {
    return tokenManager.getAccessToken();
  },

  // Get stored refresh token
  getRefreshToken: () => {
    return tokenManager.getRefreshToken();
  },

  // Clear all authentication data
  clearAuth: () => {
    tokenManager.clearTokens();
  },

  // Check if token is expired (basic check)
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  // Get user info from token
  getUserFromToken: (token) => {
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub || payload.userId,
        email: payload.email,
        name: payload.name || payload.full_name
      };
    } catch (error) {
      return null;
    }
  },

  // Auto-logout when token expires
  setupAutoLogout: () => {
    const token = tokenManager.getAccessToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      if (timeUntilExpiration > 0) {
        setTimeout(() => {
          authUtils.clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }, timeUntilExpiration);
      }
    } catch (error) {
      console.error('Error setting up auto-logout:', error);
    }
  }
};

export default authApi;