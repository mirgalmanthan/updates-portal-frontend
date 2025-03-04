import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { LoginCredentials, EmailLoginCredentials, RegistrationData } from '../services/authService';

// Define the shape of our context
interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  loading: boolean;
  error: string | null;
  adminLogin: (credentials: LoginCredentials) => Promise<boolean>;
  userLogin: (credentials: EmailLoginCredentials) => Promise<boolean>;
  registerUser: (data: RegistrationData) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  clearError: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  loading: false,
  error: null,
  adminLogin: async () => false,
  userLogin: async () => false,
  registerUser: async () => ({ success: false }),
  logout: () => {},
  clearError: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [userRole, setUserRole] = useState<string | null>(authService.getUserRole());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      setIsAuthenticated(authService.isAuthenticated());
      setUserRole(authService.getUserRole());
    };

    checkAuthStatus();
  }, []);

  // Admin login
  const adminLogin = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.adminLogin(credentials);
      
      if (response.success && response.data) {
        setIsAuthenticated(true);
        setUserRole('admin');
        setLoading(false);
        return true;
      } else {
        setError(response.error || 'Login failed');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
      return false;
    }
  };

  // User login
  const userLogin = async (credentials: EmailLoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.userLogin(credentials);
      
      if (response.success && response.data) {
        setIsAuthenticated(true);
        setUserRole('user');
        setLoading(false);
        return true;
      } else {
        setError(response.error || 'Login failed');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
      return false;
    }
  };

  // User registration
  const registerUser = async (data: RegistrationData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.registerUser(data);
      setLoading(false);
      
      if (response.success) {
        return {
          success: true,
          message: response.data?.payload?.message || 'Registration successful'
        };
      } else {
        setError(response.error || 'Registration failed');
        return {
          success: false,
          error: response.error || 'Registration failed'
        };
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUserRole(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Create the value object
  const value = {
    isAuthenticated,
    userRole,
    loading,
    error,
    adminLogin,
    userLogin,
    registerUser,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
