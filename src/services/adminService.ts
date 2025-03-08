import apiClient, { ApiResponse } from './api';

// Types
export interface UserUpdate {
  _id: string;
  name: string;
  role: string;
  updates: {
    ops: Array<{
      insert?: string;
      attributes?: {
        bold?: boolean;
        underline?: boolean;
        list?: string;
      };
    }>;
  };
  date_of_update: string;
}

export interface EmailData {
  updates: string[]; // Array of update IDs
  emailSubject: string;
  emailContent: string;
}

const adminService = {
  // Get all updates for a specific date
  getUpdates: async (date: string): Promise<ApiResponse<{ updates: UserUpdate[] }>> => {
    try {
      const response = await apiClient.get(`/admin/viewUpdates/${date}`);
      return {
        success: true,
        data: response.data.payload
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.payload?.message || 'Failed to fetch updates.'
      };
    }
  },

  // Create and send email for a specific date
  createMailForDate: async (date: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiClient.post('/admin/createMail', { date });
      return {
        success: true,
        data: response.data.payload
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.payload?.message || 'Failed to create and send email.'
      };
    }
  }
};

export default adminService;
