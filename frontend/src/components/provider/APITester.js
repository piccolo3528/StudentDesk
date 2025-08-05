import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Chip,
  CircularProgress,
  Collapse,
  TextField,
  Alert
} from '@mui/material';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const APITester = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState('/api/providers/stats');
  
  // Define endpoints to test
  const providerEndpoints = [
    { name: 'Profile', url: '/api/user/profile', method: 'GET' },
    { name: 'Stats', url: '/api/providers/stats', method: 'GET' },
    { name: 'Meal Plans', url: '/api/providers/meal-plans', method: 'GET' },
    { name: 'Menu Items', url: '/api/providers/menu-items', method: 'GET' },
    { name: 'Subscribers', url: '/api/providers/subscribers', method: 'GET' },
    { name: 'Orders', url: '/api/providers/orders', method: 'GET' }
  ];
  
  const testEndpoint = async (endpoint) => {
    try {
      const startTime = Date.now();
      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        timeout: 10000
      });
      const endTime = Date.now();
      
      return {
        endpoint: endpoint.name,
        url: endpoint.url,
        status: response.status,
        success: true,
        time: `${endTime - startTime}ms`,
        data: response.data
      };
    } catch (error) {
      return {
        endpoint: endpoint.name,
        url: endpoint.url,
        status: error.response?.status || 'Network Error',
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  };
  
  const testAllEndpoints = async () => {
    setLoading(true);
    setResults([]);
    
    const testResults = [];
    for (const endpoint of providerEndpoints) {
      const result = await testEndpoint(endpoint);
      testResults.push(result);
      // Update results in real-time
      setResults([...testResults]);
    }
    
    setLoading(false);
  };
  
  const testCustomEndpoint = async () => {
    setLoading(true);
    const result = await testEndpoint({
      name: 'Custom',
      url: customEndpoint,
      method: 'GET'
    });
    
    setResults([result]);
    setLoading(false);
  };
  
  return (
    <Paper sx={{ p: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          API Endpoint Tester
        </Typography>
        <Button 
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          size="small"
        >
          {expanded ? 'Hide' : 'Show'}
        </Button>
      </Box>
      
      <Collapse in={expanded}>
        <Alert severity="info" sx={{ mb: 2 }}>
          This tool helps diagnose API connection issues. Click "Run Tests" to check all provider endpoints.
        </Alert>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Custom Endpoint Test
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              placeholder="/api/providers/stats"
              label="API Endpoint"
            />
            <Button 
              variant="outlined" 
              onClick={testCustomEndpoint} 
              disabled={loading}
            >
              Test
            </Button>
          </Box>
        </Box>
        
        <Button 
          variant="contained" 
          onClick={testAllEndpoints} 
          disabled={loading} 
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
          Run Tests
        </Button>
        
        <List>
          {results.map((result, index) => (
            <ListItem key={index} divider>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ mr: 1 }}>
                      {result.endpoint}
                    </Typography>
                    <Chip
                      label={result.success ? (result.status || '200') : (result.status || 'Error')}
                      color={result.success ? 'success' : 'error'}
                      size="small"
                    />
                    {result.time && (
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {result.time}
                      </Typography>
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary" component="div">
                      {result.url}
                    </Typography>
                    {!result.success && (
                      <Typography variant="body2" color="error" component="div">
                        {result.message}
                      </Typography>
                    )}
                    {result.success && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          maxHeight: 100, 
                          overflow: 'auto', 
                          backgroundColor: 'background.paper', 
                          p: 1,
                          borderRadius: 1
                        }}
                      >
                        {JSON.stringify(result.data).substring(0, 200)}...
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Paper>
  );
};

export default APITester; 