import apiClient, { handleApiError, handleApiResponse } from './apiClient';

// Journal API client
export const journalApi = {
  // Get all journals for the current user
  getJournals: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add optional query parameters
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.category) queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/journals?${queryString}` : '/journals';
      
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get a specific journal by ID
  getJournal: async (journalId) => {
    try {
      if (!journalId) {
        throw new Error('Journal ID is required');
      }
      
      const response = await apiClient.get(`/journals/${journalId}`);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Create a new journal
  createJournal: async (journalData) => {
    try {
      if (!journalData.title) {
        throw new Error('Journal title is required');
      }
      
      const response = await apiClient.post('/journals', journalData);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Update an existing journal
  updateJournal: async (journalId, journalData) => {
    try {
      if (!journalId) {
        throw new Error('Journal ID is required');
      }
      
      const response = await apiClient.put(`/journals/${journalId}`, journalData);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Partially update a journal
  patchJournal: async (journalId, journalData) => {
    try {
      if (!journalId) {
        throw new Error('Journal ID is required');
      }
      
      const response = await apiClient.patch(`/journals/${journalId}`, journalData);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Delete a journal
  deleteJournal: async (journalId) => {
    try {
      if (!journalId) {
        throw new Error('Journal ID is required');
      }
      
      const response = await apiClient.delete(`/journals/${journalId}`);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get journal statistics
  getJournalStats: async (journalId) => {
    try {
      if (!journalId) {
        throw new Error('Journal ID is required');
      }
      
      const response = await apiClient.get(`/journals/${journalId}/stats`);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get journal photos
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

  // Add photo to journal
  addPhotoToJournal: async (journalId, photoData) => {
    try {
      if (!journalId) {
        throw new Error('Journal ID is required');
      }
      
      const response = await apiClient.post(`/journals/${journalId}/photos`, photoData);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Get journal reminders
  getJournalReminders: async (journalId) => {
    try {
      if (!journalId) {
        throw new Error('Journal ID is required');
      }
      
      const response = await apiClient.get(`/journals/${journalId}/reminders`);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Create journal reminder
  createJournalReminder: async (journalId, reminderData) => {
    try {
      if (!journalId) {
        throw new Error('Journal ID is required');
      }
      
      const response = await apiClient.post(`/journals/${journalId}/reminders`, reminderData);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Update journal reminder
  updateJournalReminder: async (journalId, reminderId, reminderData) => {
    try {
      if (!journalId || !reminderId) {
        throw new Error('Journal ID and Reminder ID are required');
      }
      
      const response = await apiClient.put(`/journals/${journalId}/reminders/${reminderId}`, reminderData);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  },

  // Delete journal reminder
  deleteJournalReminder: async (journalId, reminderId) => {
    try {
      if (!journalId || !reminderId) {
        throw new Error('Journal ID and Reminder ID are required');
      }
      
      const response = await apiClient.delete(`/journals/${journalId}/reminders/${reminderId}`);
      return handleApiResponse(response);
    } catch (error) {
      return {
        success: false,
        ...handleApiError(error)
      };
    }
  }
};

// Journal utilities
export const journalUtils = {
  // Validate journal data
  validateJournalData: (journalData) => {
    const errors = [];
    
    if (!journalData.title || journalData.title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    if (journalData.title && journalData.title.length > 255) {
      errors.push('Title must be less than 255 characters');
    }
    
    if (journalData.description && journalData.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }
    
    const validCategories = ['fitness', 'skincare', 'hair', 'weight', 'other'];
    if (journalData.category && !validCategories.includes(journalData.category)) {
      errors.push('Invalid category');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format journal data for display
  formatJournalData: (journal) => {
    return {
      ...journal,
      createdAt: new Date(journal.created_at),
      updatedAt: new Date(journal.updated_at),
      categoryLabel: journalUtils.getCategoryLabel(journal.category)
    };
  },

  // Get category display label
  getCategoryLabel: (category) => {
    const categoryLabels = {
      fitness: 'Fitness',
      skincare: 'Skincare',
      hair: 'Hair',
      weight: 'Weight',
      other: 'Other'
    };
    
    return categoryLabels[category] || 'Other';
  },

  // Sort journals by different criteria
  sortJournals: (journals, sortBy = 'created_at', sortOrder = 'desc') => {
    return [...journals].sort((a, b) => {
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

  // Filter journals by category
  filterJournalsByCategory: (journals, category) => {
    if (!category || category === 'all') {
      return journals;
    }
    
    return journals.filter(journal => journal.category === category);
  },

  // Search journals by title or description
  searchJournals: (journals, searchTerm) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return journals;
    }
    
    const term = searchTerm.toLowerCase();
    return journals.filter(journal => 
      journal.title.toLowerCase().includes(term) ||
      (journal.description && journal.description.toLowerCase().includes(term))
    );
  }
};

export default journalApi;