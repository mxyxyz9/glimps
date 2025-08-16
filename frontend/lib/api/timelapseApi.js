import apiClient, { handleApiError, handleApiResponse } from './apiClient';

/**
 * Timelapse API client
 * Handles all timelapse-related API calls
 */
export const timelapseApi = {
  // Generate a new timelapse from journal photos
  generateTimelapse: async (journalId, options = {}) => {
    try {
      if (!journalId) {
        throw new Error('Journal ID is required');
      }

      // Validate and prepare options
      const timelapseOptions = {
        fps: options.fps && options.fps >= 1 && options.fps <= 60 ? options.fps : 10,
        resolution: ['480p', '720p', '1080p', '1440p'].includes(options.resolution) ? 
          options.resolution : '720p',
        format: ['mp4', 'webm'].includes(options.format) ? options.format : 'mp4',
        duration: options.duration && options.duration > 0 ? options.duration : null
      };

      const requestData = {
        journal_id: journalId,
        options: timelapseOptions
      };

      const response = await apiClient.post('/timelapse/generate', requestData);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get timelapse job status
  getTimelapseStatus: async (jobId) => {
    try {
      if (!jobId) {
        throw new Error('Job ID is required');
      }

      const response = await apiClient.get(`/timelapse/${jobId}`);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get user's timelapse history
  getUserTimelapses: async (options = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add optional query parameters
      if (options.limit) {
        const limit = parseInt(options.limit, 10);
        if (limit >= 1 && limit <= 100) {
          queryParams.append('limit', limit);
        }
      }
      
      if (options.offset) {
        const offset = parseInt(options.offset, 10);
        if (offset >= 0) {
          queryParams.append('offset', offset);
        }
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/timelapse?${queryString}` : '/timelapse';
      
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Cancel a timelapse job
  cancelTimelapse: async (jobId) => {
    try {
      if (!jobId) {
        throw new Error('Job ID is required');
      }

      const response = await apiClient.delete(`/timelapse/${jobId}`);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get timelapse generation options and limits
  getTimelapseOptions: async () => {
    try {
      const response = await apiClient.get('/timelapse/options');
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get timelapse statistics for a journal
  getJournalTimelapseStats: async (journalId) => {
    try {
      if (!journalId) {
        throw new Error('Journal ID is required');
      }

      const response = await apiClient.get(`/journals/${journalId}/timelapse/stats`);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Health check for timelapse service
  getTimelapseHealth: async () => {
    try {
      const response = await apiClient.get('/timelapse/health');
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  }
};

/**
 * Timelapse utilities
 * Helper functions for processing and managing timelapse data
 */
export const timelapseUtils = {
  // Validate timelapse options
  validateTimelapseOptions: (options) => {
    const errors = [];
    
    if (options.fps && (options.fps < 1 || options.fps > 60)) {
      errors.push('FPS must be between 1 and 60');
    }
    
    if (options.resolution && !['480p', '720p', '1080p', '1440p'].includes(options.resolution)) {
      errors.push('Resolution must be one of: 480p, 720p, 1080p, 1440p');
    }
    
    if (options.format && !['mp4', 'webm'].includes(options.format)) {
      errors.push('Format must be either mp4 or webm');
    }
    
    if (options.duration && options.duration <= 0) {
      errors.push('Duration must be greater than 0');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format timelapse job status for display
  formatJobStatus: (status) => {
    const statusMap = {
      'queued': {
        label: 'Queued',
        color: 'blue',
        description: 'Your timelapse is waiting to be processed'
      },
      'processing': {
        label: 'Processing',
        color: 'yellow',
        description: 'Your timelapse is being generated'
      },
      'completed': {
        label: 'Completed',
        color: 'green',
        description: 'Your timelapse is ready'
      },
      'failed': {
        label: 'Failed',
        color: 'red',
        description: 'Timelapse generation failed'
      },
      'cancelled': {
        label: 'Cancelled',
        color: 'gray',
        description: 'Timelapse generation was cancelled'
      }
    };
    
    return statusMap[status] || {
      label: 'Unknown',
      color: 'gray',
      description: 'Unknown status'
    };
  },

  // Calculate estimated processing time
  calculateEstimatedTime: (photoCount, options = {}) => {
    if (!photoCount || photoCount < 2) {
      return null;
    }

    // Base processing time per photo (in seconds)
    let baseTimePerPhoto = 2;
    
    // Adjust based on resolution
    const resolutionMultipliers = {
      '480p': 1,
      '720p': 1.5,
      '1080p': 2.5,
      '1440p': 4
    };
    
    const resolutionMultiplier = resolutionMultipliers[options.resolution] || 1.5;
    const estimatedSeconds = Math.max(30, photoCount * baseTimePerPhoto * resolutionMultiplier);
    
    return {
      seconds: estimatedSeconds,
      formatted: timelapseUtils.formatDuration(estimatedSeconds)
    };
  },

  // Format duration in seconds to human readable format
  formatDuration: (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  },

  // Get resolution dimensions
  getResolutionDimensions: (resolution) => {
    const dimensions = {
      '480p': { width: 854, height: 480 },
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '1440p': { width: 2560, height: 1440 }
    };
    
    return dimensions[resolution] || dimensions['720p'];
  },

  // Calculate timelapse duration based on photos and FPS
  calculateTimelapseLength: (photoCount, fps = 10) => {
    if (!photoCount || photoCount < 2) {
      return 0;
    }
    
    return photoCount / fps;
  },

  // Format timelapse data for display
  formatTimelapseData: (timelapse) => {
    if (!timelapse) return null;

    const statusInfo = timelapseUtils.formatJobStatus(timelapse.status);
    const dimensions = timelapseUtils.getResolutionDimensions(timelapse.resolution);
    
    return {
      ...timelapse,
      statusInfo,
      dimensions,
      createdAt: new Date(timelapse.created_at),
      updatedAt: new Date(timelapse.updated_at),
      completedAt: timelapse.completed_at ? new Date(timelapse.completed_at) : null,
      formattedFileSize: timelapse.file_size ? timelapseUtils.formatFileSize(timelapse.file_size) : null,
      formattedDuration: timelapse.duration ? timelapseUtils.formatDuration(timelapse.duration) : null
    };
  },

  // Sort timelapses by different criteria
  sortTimelapses: (timelapses, sortBy = 'created_at', sortOrder = 'desc') => {
    return [...timelapses].sort((a, b) => {
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

  // Filter timelapses by status
  filterTimelapsesByStatus: (timelapses, status) => {
    if (!status || status === 'all') {
      return timelapses;
    }
    
    return timelapses.filter(timelapse => timelapse.status === status);
  },

  // Filter timelapses by journal
  filterTimelapsesByJournal: (timelapses, journalId) => {
    if (!journalId || journalId === 'all') {
      return timelapses;
    }
    
    return timelapses.filter(timelapse => timelapse.journal_id === journalId);
  },

  // Check if timelapse can be cancelled
  canCancelTimelapse: (timelapse) => {
    return timelapse && ['queued', 'processing'].includes(timelapse.status);
  },

  // Check if timelapse can be downloaded
  canDownloadTimelapse: (timelapse) => {
    return timelapse && timelapse.status === 'completed' && timelapse.video_url;
  },

  // Generate timelapse preview URL
  getPreviewUrl: (timelapse) => {
    if (!timelapse || timelapse.status !== 'completed') {
      return null;
    }
    
    return timelapse.preview_url || timelapse.video_url;
  },

  // Validate minimum photos for timelapse
  validateMinimumPhotos: (photoCount) => {
    const minPhotos = 2;
    
    return {
      isValid: photoCount >= minPhotos,
      minPhotos,
      currentCount: photoCount,
      message: photoCount < minPhotos ? 
        `At least ${minPhotos} photos are required to create a timelapse` : null
    };
  },

  // Get recommended timelapse settings based on photo count
  getRecommendedSettings: (photoCount) => {
    if (photoCount < 2) {
      return null;
    }

    let recommendedFps = 10;
    let recommendedResolution = '720p';
    
    // Adjust FPS based on photo count
    if (photoCount < 10) {
      recommendedFps = 5;
    } else if (photoCount > 100) {
      recommendedFps = 15;
    }
    
    // Adjust resolution based on photo count (more photos = higher quality)
    if (photoCount > 50) {
      recommendedResolution = '1080p';
    } else if (photoCount < 20) {
      recommendedResolution = '480p';
    }

    const estimatedLength = timelapseUtils.calculateTimelapseLength(photoCount, recommendedFps);
    const estimatedTime = timelapseUtils.calculateEstimatedTime(photoCount, { 
      resolution: recommendedResolution 
    });

    return {
      fps: recommendedFps,
      resolution: recommendedResolution,
      format: 'mp4',
      estimatedLength: {
        seconds: estimatedLength,
        formatted: timelapseUtils.formatDuration(estimatedLength)
      },
      estimatedProcessingTime: estimatedTime
    };
  }
};

export default timelapseApi;