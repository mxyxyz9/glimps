import apiClient, { handleApiError, handleApiResponse } from './apiClient';

// Photo API client
export const photoApi = {
  // Get all photos for the current user
  getPhotos: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add optional query parameters
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.journalId) queryParams.append('journalId', params.journalId);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/photos?${queryString}` : '/photos';
      
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get a specific photo by ID
  getPhoto: async (photoId) => {
    try {
      if (!photoId) {
        throw new Error('Photo ID is required');
      }
      
      const response = await apiClient.get(`/photos/${photoId}`);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Upload a new photo
  uploadPhoto: async (photoData, onUploadProgress = null) => {
    try {
      const formData = new FormData();
      
      // Add photo file
      if (photoData.file) {
        formData.append('photo', photoData.file);
      } else {
        throw new Error('Photo file is required');
      }
      
      // Add metadata
      if (photoData.journalId) {
        formData.append('journalId', photoData.journalId);
      }
      if (photoData.notes) {
        formData.append('notes', photoData.notes);
      }
      if (photoData.takenAt) {
        formData.append('takenAt', photoData.takenAt);
      }
      if (photoData.metadata) {
        formData.append('metadata', JSON.stringify(photoData.metadata));
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      // Add upload progress callback if provided
      if (onUploadProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        };
      }
      
      const response = await apiClient.post('/photos', formData, config);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Upload multiple photos
  uploadPhotos: async (photosData, onUploadProgress = null) => {
    try {
      const formData = new FormData();
      
      // Add photo files
      if (photosData.files && photosData.files.length > 0) {
        photosData.files.forEach((file, index) => {
          formData.append(`photos`, file);
        });
      } else {
        throw new Error('At least one photo file is required');
      }
      
      // Add shared metadata
      if (photosData.journalId) {
        formData.append('journalId', photosData.journalId);
      }
      if (photosData.notes) {
        formData.append('notes', photosData.notes);
      }
      if (photosData.metadata) {
        formData.append('metadata', JSON.stringify(photosData.metadata));
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      // Add upload progress callback if provided
      if (onUploadProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        };
      }
      
      const response = await apiClient.post('/photos/batch', formData, config);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Update photo metadata
  updatePhoto: async (photoId, photoData) => {
    try {
      if (!photoId) {
        throw new Error('Photo ID is required');
      }
      
      const response = await apiClient.put(`/photos/${photoId}`, photoData);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Partially update photo metadata
  patchPhoto: async (photoId, photoData) => {
    try {
      if (!photoId) {
        throw new Error('Photo ID is required');
      }
      
      const response = await apiClient.patch(`/photos/${photoId}`, photoData);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Delete a photo
  deletePhoto: async (photoId) => {
    try {
      if (!photoId) {
        throw new Error('Photo ID is required');
      }
      
      const response = await apiClient.delete(`/photos/${photoId}`);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Delete multiple photos
  deletePhotos: async (photoIds) => {
    try {
      if (!photoIds || photoIds.length === 0) {
        throw new Error('Photo IDs are required');
      }
      
      const response = await apiClient.delete('/photos/batch', {
        data: { photoIds }
      });
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get photo download URL
  getPhotoDownloadUrl: async (photoId) => {
    try {
      if (!photoId) {
        throw new Error('Photo ID is required');
      }
      
      const response = await apiClient.get(`/photos/${photoId}/download`);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get photo thumbnail URL
  getPhotoThumbnailUrl: async (photoId, size = 'medium') => {
    try {
      if (!photoId) {
        throw new Error('Photo ID is required');
      }
      
      const response = await apiClient.get(`/photos/${photoId}/thumbnail?size=${size}`);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get photos for a specific journal
  getJournalPhotos: async (journalId, params = {}) => {
    try {
      if (!journalId) {
        throw new Error('Journal ID is required');
      }
      
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const queryString = queryParams.toString();
      const url = queryString 
        ? `/journals/${journalId}/photos?${queryString}` 
        : `/journals/${journalId}/photos`;
      
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Add existing photo to journal
  addPhotoToJournal: async (journalId, photoId) => {
    try {
      if (!journalId || !photoId) {
        throw new Error('Journal ID and Photo ID are required');
      }
      
      const response = await apiClient.post(`/journals/${journalId}/photos/${photoId}`);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Remove photo from journal
  removePhotoFromJournal: async (journalId, photoId) => {
    try {
      if (!journalId || !photoId) {
        throw new Error('Journal ID and Photo ID are required');
      }
      
      const response = await apiClient.delete(`/journals/${journalId}/photos/${photoId}`);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  }
};

// Photo utilities
export const photoUtils = {
  // Validate photo file
  validatePhotoFile: (file) => {
    const errors = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!file) {
      errors.push('Photo file is required');
      return { isValid: false, errors };
    }
    
    if (file.size > maxSize) {
      errors.push('Photo file must be less than 10MB');
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('Photo must be a JPEG, PNG, or WebP image');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate multiple photo files
  validatePhotoFiles: (files) => {
    const errors = [];
    const maxFiles = 20;
    
    if (!files || files.length === 0) {
      errors.push('At least one photo file is required');
      return { isValid: false, errors };
    }
    
    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} photos can be uploaded at once`);
    }
    
    // Validate each file
    files.forEach((file, index) => {
      const validation = photoUtils.validatePhotoFile(file);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          errors.push(`File ${index + 1}: ${error}`);
        });
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format photo data for display
  formatPhotoData: (photo) => {
    return {
      ...photo,
      createdAt: new Date(photo.created_at),
      takenAt: photo.taken_at ? new Date(photo.taken_at) : null,
      fileSize: photoUtils.formatFileSize(photo.file_size),
      dimensions: photo.metadata?.width && photo.metadata?.height 
        ? `${photo.metadata.width}x${photo.metadata.height}`
        : null
    };
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (!bytes) return 'Unknown';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  // Create photo preview URL
  createPreviewUrl: (file) => {
    if (!file) return null;
    return URL.createObjectURL(file);
  },

  // Revoke photo preview URL
  revokePreviewUrl: (url) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  },

  // Sort photos by different criteria
  sortPhotos: (photos, sortBy = 'taken_at', sortOrder = 'desc') => {
    return [...photos].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle date sorting
      if (sortBy.includes('_at')) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  },

  // Filter photos by date range
  filterPhotosByDateRange: (photos, startDate, endDate) => {
    if (!startDate && !endDate) {
      return photos;
    }
    
    return photos.filter(photo => {
      const photoDate = new Date(photo.taken_at || photo.created_at);
      
      if (startDate && photoDate < new Date(startDate)) {
        return false;
      }
      
      if (endDate && photoDate > new Date(endDate)) {
        return false;
      }
      
      return true;
    });
  },

  // Group photos by date
  groupPhotosByDate: (photos) => {
    const groups = {};
    
    photos.forEach(photo => {
      const date = new Date(photo.taken_at || photo.created_at);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(photo);
    });
    
    return groups;
  }
};

export default photoApi;