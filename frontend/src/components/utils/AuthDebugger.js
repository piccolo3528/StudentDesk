import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import { apiClient } from '../../utils/api';

/**
 * Component for debugging authentication issues
 */
const AuthDebugger = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const testDirectAxios = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      // Use direct axios instead of our enhanced client
      const response = await axios.post('/api/auth/login', credentials);
      setResults({
        type: 'Direct Axios',
        status: response.status,
        data: response.data,
        headers: response.headers
      });
    } catch (err) {
      console.error('Direct Axios Error:', err);
      setError({
        type: 'Direct Axios',
        message: err.message,
        response: err.response?.data || null,
        status: err.response?.status || 'Network Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testApiClient = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      // Use our enhanced API client
      const response = await apiClient.post('/auth/login', credentials);
      setResults({
        type: 'API Client',
        status: response.status,
        data: response.data,
        headers: response.headers
      });
    } catch (err) {
      console.error('API Client Error:', err);
      setError({
        type: 'API Client',
        message: err.displayMessage || err.message,
        response: err.data || null,
        status: err.status || 'Unknown'
      });
    } finally {
      setLoading(false);
    }
  };

  const testFetch = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      // Use native fetch API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      setResults({
        type: 'Fetch API',
        status: response.status,
        data: data,
        headers: Object.fromEntries([...response.headers])
      });
    } catch (err) {
      console.error('Fetch Error:', err);
      setError({
        type: 'Fetch API',
        message: err.message,
        status: 'Network Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkApiBaseUrl = () => {
    return {
      axios: axios.defaults.baseURL || 'Not set',
      apiClient: apiClient.defaults.baseURL || 'Not set',
      global: window.location.origin
    };
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Authentication Debugger
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box component="form" sx={{ mb: 3 }}>
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
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            fullWidth
            onClick={testDirectAxios}
            disabled={loading || !credentials.email || !credentials.password}
          >
            Test Direct Axios
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            fullWidth
            onClick={testApiClient}
            disabled={loading || !credentials.email || !credentials.password}
          >
            Test API Client
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            fullWidth
            onClick={testFetch}
            disabled={loading || !credentials.email || !credentials.password}
          >
            Test Fetch API
          </Button>
        </Grid>
      </Grid>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            {error.type} Error: {error.status}
          </Typography>
          <Typography variant="body2">
            {error.message}
          </Typography>
          {error.response && (
            <Box 
              component="pre" 
              sx={{ 
                mt: 1, 
                p: 1, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                fontSize: '0.75rem',
                maxHeight: 100,
                overflow: 'auto'
              }}
            >
              {JSON.stringify(error.response, null, 2)}
            </Box>
          )}
        </Alert>
      )}
      
      {results && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            {results.type} Success: {results.status}
          </Typography>
          <Box 
            component="pre" 
            sx={{ 
              mt: 1, 
              p: 1, 
              bgcolor: 'background.paper', 
              borderRadius: 1,
              fontSize: '0.75rem',
              maxHeight: 200,
              overflow: 'auto'
            }}
          >
            {JSON.stringify(results.data, null, 2)}
          </Box>
        </Alert>
      )}
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>API Configuration</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle2" gutterBottom>
            Base URLs:
          </Typography>
          <Box 
            component="pre" 
            sx={{ 
              p: 1, 
              bgcolor: 'background.paper', 
              borderRadius: 1,
              fontSize: '0.75rem'
            }}
          >
            {JSON.stringify(checkApiBaseUrl(), null, 2)}
          </Box>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Current Authentication:
          </Typography>
          <Box>
            <Typography variant="body2">
              Token in localStorage: {localStorage.getItem('token') ? 'Present' : 'Not found'}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default AuthDebugger; 