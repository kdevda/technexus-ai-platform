import api from '../config/api';

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  users?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    status: string;
  }[];
}

export const organizationService = {
  /**
   * Test the API connection
   */
  test: async (): Promise<any> => {
    try {
      console.log('Testing API connection to organizations/test endpoint');
      const response = await api.get('/organizations/test');
      console.log('API test response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API test error:', error);
      // Add more detailed error information
      const errorDetails = {
        error: 'Test endpoint failed',
        details: error.message,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          baseURL: error.config.baseURL,
        } : 'No config available',
        status: error.response ? error.response.status : 'No response'
      };
      console.error('Detailed error:', errorDetails);
      throw errorDetails;
    }
  },

  /**
   * Get all organizations
   */
  getAll: async (): Promise<Organization[]> => {
    try {
      console.log('Fetching all organizations');
      const response = await api.get('/organizations');
      
      // Log the raw response for debugging
      console.log('Raw API response:', response);
      
      // Ensure we always return an array
      if (!response.data) {
        console.error('No data in response');
        return [];
      }
      
      if (!Array.isArray(response.data)) {
        console.error('Response data is not an array:', response.data);
        return Array.isArray(response.data.organizations) 
          ? response.data.organizations 
          : [];
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error in getAll organizations:', error);
      console.error('Error details:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return [];
    }
  },

  /**
   * Get organization by ID
   */
  getById: async (id: string): Promise<Organization> => {
    try {
      const response = await api.get(`/organizations/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching organization ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new organization
   */
  create: async (name: string): Promise<Organization> => {
    try {
      const response = await api.post('/organizations', { name });
      return response.data;
    } catch (error: any) {
      console.error('Error creating organization:', error);
      throw error;
    }
  },

  /**
   * Update an organization
   */
  update: async (id: string, name: string): Promise<Organization> => {
    try {
      const response = await api.put(`/organizations/${id}`, { name });
      return response.data;
    } catch (error: any) {
      console.error(`Error updating organization ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an organization
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/organizations/${id}`);
    } catch (error: any) {
      console.error(`Error deleting organization ${id}:`, error);
      throw error;
    }
  },
}; 