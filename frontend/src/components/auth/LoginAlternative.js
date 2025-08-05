import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { apiClient, testApiConnection } from '../../utils/api';
import logger from '../../utils/logger';

// Helper for safe logging
const safeLog = (level, message, data) => {
  try {
    if (logger && typeof logger[level] === 'function') {
      logger[level](message, data);
    } else {
      console[level]('[FALLBACK]', message, data);
    }
  } catch (err) {
    console[level]('[ERROR-LOGGER]', message, data);
  }
};

/**
 * Alternative login component that bypasses the AuthContext for diagnostic purposes
 */
const LoginAlternative = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const directLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Make sure we're using a clean instance without previous state
      delete apiClient.defaults.headers.common['Authorization'];
      
      // Test base URL configuration
      const baseUrl = apiClient.defaults.baseURL;
      safeLog('debug', 'Using base URL for login:', baseUrl);
      
      // Make direct call to login endpoint
      const response = await apiClient.post('/auth/login', credentials);
      
      // Handle successful login
      setResult({
        success: true,
        status: response.status,
        data: response.data
      });
      
      // Store token manually
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        safeLog('info', 'Token stored in localStorage');
      }
      
    } catch (err) {
      safeLog('error', 'Direct login attempt failed', err);
      
      setError({
        message: err.displayMessage || err.message || 'Login failed',
        status: err.status || err.response?.status || 'Unknown',
        data: err.data || err.response?.data || {},
        endpoint: err.endpoint || err.config?.url || '/auth/login'
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setConnectionStatus({ checking: true });
    
    try {
      const result = await testApiConnection();
      
      if (result.success) {
        setConnectionStatus({
          success: true,
          message: 'API connection successful',
          data: result.data
        });
      } else {
        setConnectionStatus({
          success: false,
          message: 'API connection failed',
          error: result.error
        });
      }
    } catch (err) {
      setConnectionStatus({
        success: false,
        message: 'Error testing API connection',
        error: err
      });
    }
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    setResult({ tokenCleared: true });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Alternative Login Method
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        This form bypasses the usual authentication flow for diagnostic purposes.
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={testConnection}
          disabled={connectionStatus?.checking}
          sx={{ mb: 2 }}
        >
          {connectionStatus?.checking ? 'Checking...' : 'Test API Connection'}
        </Button>
        
        {connectionStatus && !connectionStatus.checking && (
          <Alert 
            severity={connectionStatus.success ? 'success' : 'error'}
            sx={{ mb: 2 }}
          >
            {connectionStatus.message}
            {connectionStatus.data && (
              <Box component="pre" sx={{ mt: 1, fontSize: '0.75rem', maxHeight: 100, overflow: 'auto' }}>
                {JSON.stringify(connectionStatus.data, null, 2)}
              </Box>
            )}
          </Alert>
        )}
      </Box>
      
      <TextField
        label="Email"
        name="email"
        value={credentials.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      
      <TextField
        label="Password"
        name="password"
        type="password"
        value={credentials.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          onClick={directLogin}
          disabled={loading || !credentials.email || !credentials.password}
        >
          {loading ? <CircularProgress size={24} /> : 'Login Directly'}
        </Button>
        
        <Button
          variant="outlined"
          color="secondary"
          onClick={clearToken}
        >
          Clear Token
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Login Error ({error.status})
          </Typography>
          <Typography variant="body2">
            {error.message}
          </Typography>
          <Box component="pre" sx={{ mt: 1, fontSize: '0.75rem', maxHeight: 150, overflow: 'auto' }}>
            {JSON.stringify(error.data, null, 2)}
          </Box>
        </Alert>
      )}
      
      {result && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {result.tokenCleared 
              ? 'Token Cleared Successfully' 
              : `Login Success (${result.status})`}
          </Typography>
          {result.data && (
            <Box component="pre" sx={{ mt: 1, fontSize: '0.75rem', maxHeight: 200, overflow: 'auto' }}>
              {JSON.stringify(result.data, null, 2)}
            </Box>
          )}
        </Alert>
      )}
    </Paper>
  );
};

export default LoginAlternative; 