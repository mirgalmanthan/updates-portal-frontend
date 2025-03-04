import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

// Base API URL - use proxy in development
const API_BASE_URL = 'https://6t2qxf4x45.execute-api.ap-south-1.amazonaws.com/v1/api';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Add request interceptor for auth token if needed
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    // Don't add token for login endpoints
    if (token && !config.url?.includes('/login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', error.response.data);
      
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        // Clear token and redirect to login if needed
        localStorage.removeItem('auth_token');
        // You might want to redirect to login page here
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
