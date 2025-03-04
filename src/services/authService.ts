import axios from 'axios';
import apiClient, { ApiResponse } from './api';

// Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface EmailLoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username?: string;
    email?: string;
    role: string;
  };
}

// Auth service functions
const authService = {
  // Admin login
  adminLogin: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/admin/login',
        data: {
          username: credentials.username,
          password: credentials.password
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      
      
      // Store token in localStorage if login successful
      if (response.data && response.data.payload?.accessToken) {
        localStorage.setItem('auth_token', response.data.payload.accessToken);
        localStorage.setItem('user_role', 'admin');
      }
      
      return {
        success: true,
        data: {
          token: response.data.payload.accessToken,
          user: {
            id: '', // We don't get this from the response
            username: credentials.username,
            role: 'admin'
          }
        }
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.payload?.message || 'Login failed. Please check your credentials.';
      return {
        success: false,
        error: errorMessage
      };
    }
  },
  
  // User login
  userLogin: async (credentials: EmailLoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await apiClient.post('/user/login', credentials);
      console.log("response: ",response)
      // Store token in localStorage if login successful
      if (response.data && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        // localStorage.setItem('user_role', 'user');
        // localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  },
  
  // User registration
  registerUser: async (data: RegistrationData): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiClient.post('/user/register', data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.payload?.message || 'Registration failed. Please try again.'
      };
    }
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_data');
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
  
  // Get user role
  getUserRole: (): string | null => {
    return localStorage.getItem('user_role');
  },
  
  // Get current user
  getCurrentUser: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
};

export default authService;
