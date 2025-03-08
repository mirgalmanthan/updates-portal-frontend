
import apiClient, { ApiResponse } from './api';

// Types
export interface RegistrationRequest {
  _id: string;
  email: string;
  password: string;
  full_name: string;
  role: string;
  __v: number;
}

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
  // Get all registration requests (admin only)
  getRegistrationRequests: async (): Promise<ApiResponse<{ requests: RegistrationRequest[] }>> => {
    try {
      const response = await apiClient.get('/admin/getRegRequests');
      return {
        success: true,
        data: response.data.payload
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.payload?.message || 'Failed to fetch registration requests.'
      };
    }
  },

  // Accept registration request (admin only)
  acceptRegistration: async (requestId: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiClient.post(`/admin/acceptRegRequest/${requestId}`);
      return {
        success: true,
        data: response.data.payload
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.payload?.message || 'Failed to accept registration request.'
      };
    }
  },

  // Reject registration request (admin only)
  rejectRegistration: async (requestId: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiClient.post(`/admin/rejectRegRequest/${requestId}`);
      return {
        success: true,
        data: response.data.payload
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.payload?.message || 'Failed to reject registration request.'
      };
    }
  },
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
      console.log("Response from login:", response.data);
      
      // Store token in localStorage if login successful
      // The backend returns { error: false, success: true, payload: { accessToken } }
      if (response.data && response.data.payload && response.data.payload.accessToken) {
        const token = response.data.payload.accessToken;
        console.log("Setting auth_token:", token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', 'user');
        
        // You can also store user data if available
        // localStorage.setItem('user_data', JSON.stringify(response.data.user));
      } else {
        console.error("Token not found in response:", response.data);
      }
      
      return {
        success: true,
        data: {
          token: response.data.payload?.accessToken || '',
          user: {
            id: '',
            email: credentials.email,
            role: 'user'
          }
        }
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.payload?.message || 'Login failed. Please check your credentials.'
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
  
  // Get authentication token
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },
  
  // Get current user
  getCurrentUser: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
};



export default authService;
