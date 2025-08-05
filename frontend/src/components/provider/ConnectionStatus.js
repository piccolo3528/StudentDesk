import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Paper, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [checking, setChecking] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  
  useEffect(() => {
    // Get the API base URL from axios defaults
    const baseURL = axios.defaults.baseURL || window.location.origin;
    setApiBaseUrl(baseURL);
    
    checkConnection();
  }, []);
  
  const checkConnection = async () => {
    setChecking(true);
    try {
      // Try to make a simple API request to check connection
      await axios.get('/api/health', { timeout: 5000 });
      setStatus('connected');
    } catch (error) {
      console.error('API connection error:', error);
      setStatus('error');
    } finally {
      setChecking(false);
    }
  };
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        API Connection Status
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip 
            label={status === 'connected' ? 'Connected' : status === 'error' ? 'Error' : 'Checking...'}
            color={status === 'connected' ? 'success' : status === 'error' ? 'error' : 'warning'}
            size="small" 
            sx={{ mr: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            {apiBaseUrl}
          </Typography>
        </Box>
        <Button 
          size="small" 
          onClick={checkConnection}
          disabled={checking}
          startIcon={checking ? <CircularProgress size={16} /> : null}
        >
          Check
        </Button>
      </Box>
    </Paper>
  );
};

export default ConnectionStatus; 