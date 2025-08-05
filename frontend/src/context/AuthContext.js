import React, { createContext, useState, useEffect } from 'react';
import { apiClient } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set auth token on initial load and every time it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load user data when the app starts and the token changes
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await apiClient.get('/auth/me');
        setUser(res.data.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load user', err);
        setUser(null);
        setToken(null);
        
        // Our enhanced API client already has detailed error handling
        setError(err.displayMessage || 'Authentication error. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Clone and prepare the data to send
      const dataToSend = { ...userData };
      
      // Special handling for provider
      if (userData.role === 'provider') {
        // Ensure role is explicitly set
        dataToSend.role = 'provider';
        
        // Validate provider-specific fields
        if (!dataToSend.businessName) {
          throw new Error('Business name is required for providers');
        }
        
        if (!dataToSend.description) {
          throw new Error('Description is required for providers');
        }
        
        // Set rating to 0 for new providers
        dataToSend.rating = 0;
        
        // Ensure cuisine is an array
        if (typeof dataToSend.cuisine === 'string') {
          dataToSend.cuisine = dataToSend.cuisine.split(',').map(item => item.trim());
        } else if (!Array.isArray(dataToSend.cuisine)) {
          dataToSend.cuisine = [];
        }
        
        console.log('Provider registration with:', {
          role: dataToSend.role,
          email: dataToSend.email,
          businessName: dataToSend.businessName,
          description: dataToSend.description,
          cuisine: dataToSend.cuisine,
          rating: dataToSend.rating
        });
      }
      
      // Log registration data for debugging
      console.log('Attempting to register with data:', dataToSend);
      
      const res = await apiClient.post('/auth/register', dataToSend);
      console.log('Registration response:', res.data);
      
      // Check if we have either a success response or token
      if (res.data) {
        // Set token if available
        if (res.data.token) {
          setToken(res.data.token);
        }
        
        // Set user data from the appropriate location
        if (res.data.data) {
          setUser(res.data.data);
        } else if (res.data.user) {
          setUser(res.data.user);
        }
        
        return res.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Special error handling for provider registration
      if (userData.role === 'provider') {
        console.error('Provider registration error details:', err.response?.data);
      }
      
      // Set a clear error message based on enhanced error handling
      setError(err.displayMessage || 'Registration failed. Please try again.');
      
      // Re-throw the error so the component can handle it
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to login with:', credentials.email);
      const res = await apiClient.post('/auth/login', credentials);
      console.log('Login response:', res.data);
      
      // Check if we have a valid response
      if (res.data) {
        // Set token if available
        if (res.data.token) {
          setToken(res.data.token);
        }
        
        // Set user data from the appropriate location
        if (res.data.data) {
          setUser(res.data.data);
        } else if (res.data.user) {
          setUser(res.data.user);
        }
        
        return res.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Set a clear error message using enhanced error handling
      setError(err.displayMessage || 'Login failed. Please check your credentials.');
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await apiClient.get('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 