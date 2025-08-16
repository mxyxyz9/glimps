import apiClient, { handleApiError, handleApiResponse } from './apiClient';

/**
 * Analytics API client
 * Handles all analytics-related API calls
 */
export const analyticsApi = {
  // Get dashboard overview analytics
  getOverviewAnalytics: async () => {
    try {
      const response = await apiClient.get('/analytics/overview');
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get analytics for a specific journal
  getJournalAnalytics: async (journalId) => {
    try {
      if (!journalId) {
        throw new Error('Journal ID is required');
      }
      
      const response = await apiClient.get(`/analytics/journals/${journalId}`);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get progress tracking analytics
  getProgressAnalytics: async (options = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add optional query parameters
      if (options.days) {
        const days = parseInt(options.days, 10);
        if (isNaN(days) || days < 1 || days > 365) {
          throw new Error('Days must be a number between 1 and 365');
        }
        queryParams.append('days', days);
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/analytics/progress?${queryString}` : '/analytics/progress';
      
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get comparison analytics between two time periods
  getComparisonAnalytics: async (options = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add optional query parameters
      if (options.currentPeriodDays) {
        const currentDays = parseInt(options.currentPeriodDays, 10);
        if (isNaN(currentDays) || currentDays < 1 || currentDays > 365) {
          throw new Error('Current period days must be a number between 1 and 365');
        }
        queryParams.append('currentPeriodDays', currentDays);
      }
      
      if (options.previousPeriodDays) {
        const previousDays = parseInt(options.previousPeriodDays, 10);
        if (isNaN(previousDays) || previousDays < 1 || previousDays > 365) {
          throw new Error('Previous period days must be a number between 1 and 365');
        }
        queryParams.append('previousPeriodDays', previousDays);
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/analytics/comparison?${queryString}` : '/analytics/comparison';
      
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get current streak and longest streak analytics
  getStreakAnalytics: async () => {
    try {
      const response = await apiClient.get('/analytics/streak');
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
 * Analytics utilities
 * Helper functions for processing and formatting analytics data
 */
export const analyticsUtils = {
  // Format analytics data for charts
  formatChartData: (data, type = 'line') => {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    switch (type) {
      case 'line':
        return data.map(item => ({
          x: new Date(item.date),
          y: item.value,
          label: item.label || item.date
        }));
      
      case 'bar':
        return data.map(item => ({
          category: item.category || item.label,
          value: item.value,
          color: item.color || '#3b82f6'
        }));
      
      case 'pie':
        return data.map(item => ({
          name: item.name || item.label,
          value: item.value,
          percentage: item.percentage || ((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)
        }));
      
      default:
        return data;
    }
  },

  // Calculate percentage change between two values
  calculatePercentageChange: (current, previous) => {
    if (!previous || previous === 0) {
      return current > 0 ? 100 : 0;
    }
    
    return ((current - previous) / previous * 100).toFixed(1);
  },

  // Format analytics numbers for display
  formatAnalyticsNumber: (value, type = 'default') => {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    switch (type) {
      case 'percentage':
        return `${value}%`;
      
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      
      case 'compact':
        return new Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(value);
      
      case 'duration':
        if (value < 60) {
          return `${value}s`;
        } else if (value < 3600) {
          return `${Math.floor(value / 60)}m ${value % 60}s`;
        } else {
          const hours = Math.floor(value / 3600);
          const minutes = Math.floor((value % 3600) / 60);
          return `${hours}h ${minutes}m`;
        }
      
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  },

  // Generate date range for analytics queries
  generateDateRange: (days = 30) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      days
    };
  },

  // Process streak data for display
  processStreakData: (streakData) => {
    if (!streakData) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        streakStatus: 'inactive',
        daysUntilNextMilestone: null
      };
    }

    const { currentStreak = 0, longestStreak = 0 } = streakData;
    
    // Determine streak status
    let streakStatus = 'inactive';
    if (currentStreak > 0) {
      if (currentStreak >= 7) {
        streakStatus = 'excellent';
      } else if (currentStreak >= 3) {
        streakStatus = 'good';
      } else {
        streakStatus = 'active';
      }
    }

    // Calculate days until next milestone
    const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
    const nextMilestone = milestones.find(milestone => milestone > currentStreak);
    const daysUntilNextMilestone = nextMilestone ? nextMilestone - currentStreak : null;

    return {
      currentStreak,
      longestStreak,
      streakStatus,
      daysUntilNextMilestone,
      nextMilestone
    };
  },

  // Process overview analytics for dashboard
  processOverviewAnalytics: (overviewData) => {
    if (!overviewData) {
      return {
        totalJournals: 0,
        totalPhotos: 0,
        activeJournals: 0,
        recentActivity: [],
        categoryBreakdown: [],
        weeklyProgress: []
      };
    }

    return {
      totalJournals: overviewData.totalJournals || 0,
      totalPhotos: overviewData.totalPhotos || 0,
      activeJournals: overviewData.activeJournals || 0,
      recentActivity: overviewData.recentActivity || [],
      categoryBreakdown: overviewData.categoryBreakdown || [],
      weeklyProgress: overviewData.weeklyProgress || [],
      averagePhotosPerJournal: overviewData.totalJournals > 0 ? 
        (overviewData.totalPhotos / overviewData.totalJournals).toFixed(1) : 0
    };
  },

  // Process journal-specific analytics
  processJournalAnalytics: (journalData) => {
    if (!journalData) {
      return {
        photoCount: 0,
        daysSinceCreated: 0,
        daysSinceLastPhoto: null,
        averagePhotosPerWeek: 0,
        progressTrend: 'stable',
        milestones: []
      };
    }

    const createdDate = new Date(journalData.createdAt || journalData.created_at);
    const now = new Date();
    const daysSinceCreated = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    
    let daysSinceLastPhoto = null;
    if (journalData.lastPhotoDate) {
      const lastPhotoDate = new Date(journalData.lastPhotoDate);
      daysSinceLastPhoto = Math.floor((now - lastPhotoDate) / (1000 * 60 * 60 * 24));
    }

    const averagePhotosPerWeek = daysSinceCreated > 0 ? 
      ((journalData.photoCount || 0) / daysSinceCreated * 7).toFixed(1) : 0;

    return {
      photoCount: journalData.photoCount || 0,
      daysSinceCreated,
      daysSinceLastPhoto,
      averagePhotosPerWeek: parseFloat(averagePhotosPerWeek),
      progressTrend: journalData.progressTrend || 'stable',
      milestones: journalData.milestones || []
    };
  },

  // Validate analytics date range
  validateDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        isValid: false,
        error: 'Invalid date format'
      };
    }

    if (start > end) {
      return {
        isValid: false,
        error: 'Start date must be before end date'
      };
    }

    if (end > now) {
      return {
        isValid: false,
        error: 'End date cannot be in the future'
      };
    }

    const daysDifference = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    if (daysDifference > 365) {
      return {
        isValid: false,
        error: 'Date range cannot exceed 365 days'
      };
    }

    return {
      isValid: true,
      daysDifference
    };
  }
};

export default analyticsApi;