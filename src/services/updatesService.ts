import axios from 'axios';
import authService from './authService';
import apiClient from './api';

// Define the base URL for the API - using the same as in api.ts
const API_BASE_URL = 'https://6t2qxf4x45.execute-api.ap-south-1.amazonaws.com/v1/api';

// Define the interface for an update
export interface Update {
  id?: string;
  date_of_update?: string;
  updates?: object;
  name?: string;
  role?: string;
}

// Define the response interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Define the Quill Delta operation interface
interface DeltaOp {
  insert: string;
  attributes?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    list?: string;
    [key: string]: any;
  };
}

// Define the Quill Delta interface
interface QuillDelta {
  ops: DeltaOp[];
}

// Define the update content interface
interface UpdateContent {
  content: QuillDelta | object;
  [key: string]: any;
}

// Create a function to save an update
export const saveUpdate = async (content: UpdateContent): Promise<ApiResponse<Update>> => {
  try {
    // Get the auth token
    const token = authService.getToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }
    
    // Format date as required by backend (YYYY-MM-DD)
    const today = new Date();
    const date_of_update = today.toISOString().split('T')[0];
    
    // Prepare the request payload with the Quill delta object
    const updateData = {
      date_of_update: date_of_update,
      updates: content.content  // This is the Quill delta object
    };
    
    console.log('Sending update data:', updateData);
    
    // Make the API call using the correct endpoint
    // The apiClient will automatically add the Authorization header with the token
    const response = await apiClient.post('/user/postUpdates', updateData);
    
    // Check if the response has the expected structure
    if (response.data && !response.data.error) {
      return {
        success: true,
        data: response.data.payload
      };
    } else {
      return {
        success: false,
        error: response.data.payload?.message || 'Failed to save update'
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        error: error.response.data.payload?.message || 'Failed to save update'
      };
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
};

// Create a function to get user updates
export const getUserUpdates = async (): Promise<ApiResponse<Update[]>> => {
  try {
    // Get the auth token
    const token = authService.getToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }
    
    // Make the API call
    const response = await apiClient.get('/user/updates');
    
    // Check if the response has the expected structure
    if (response.data && !response.data.error) {
      return {
        success: true,
        data: response.data.payload
      };
    } else {
      return {
        success: false,
        error: response.data.payload?.message || 'Failed to get updates'
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        error: error.response.data.payload?.message || 'Failed to get updates'
      };
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
};

// Create a function to get all updates (admin only)
export const getAllUpdates = async (): Promise<ApiResponse<Update[]>> => {
  try {
    // Get the auth token
    const token = authService.getToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }
    
    // Make the API call
    const response = await apiClient.get('/admin/updates');
    
    // Check if the response has the expected structure
    if (response.data && !response.data.error) {
      return {
        success: true,
        data: response.data.payload
      };
    } else {
      return {
        success: false,
        error: response.data.payload?.message || 'Failed to get updates'
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        error: error.response.data.payload?.message || 'Failed to get updates'
      };
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
};

const updatesService = {
  saveUpdate,
  getUserUpdates,
  getAllUpdates
};

export default updatesService;
