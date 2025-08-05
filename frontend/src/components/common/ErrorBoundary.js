import React from 'react';
import { Box, Typography, Button, Paper, Alert, AlertTitle } from '@mui/material';
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

/**
 * Component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    };
  }

  /**
   * Update state when an error occurs
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Log error details when an error is caught
   */
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // You can send error reports to a service here
    // reportErrorToService(error, errorInfo);
  }

  /**
   * Toggle display of detailed error information
   */
  toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  }

  /**
   * Reset the error state and attempt to rerender
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
  }

  /**
   * Reload the page
   */
  handleRefresh = () => {
    window.location.reload();
  }

  render() {
    const { fallback, children } = this.props;
    const { hasError, error, errorInfo, showDetails } = this.state;

    // Return custom fallback UI if provided
    if (hasError && fallback) {
      return fallback(error, this.handleReset);
    }

    // Return default fallback UI if no custom one is provided
    if (hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              textAlign: 'center'
            }}
          >
            <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            
            <Typography variant="h5" component="h2" gutterBottom>
              Something went wrong
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              The application encountered an unexpected error. We're sorry for the inconvenience.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              <Button 
                variant="contained" 
                startIcon={<RefreshIcon />} 
                onClick={this.handleRefresh}
              >
                Refresh Page
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </Box>
            
            {error && (
              <Box sx={{ mt: 2, textAlign: 'left' }}>
                <Button 
                  variant="text" 
                  size="small"
                  onClick={this.toggleDetails}
                  sx={{ mb: 1 }}
                >
                  {showDetails ? 'Hide' : 'Show'} Technical Details
                </Button>
                
                {showDetails && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    <AlertTitle>Error Details</AlertTitle>
                    <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                      {error.toString()}
                    </Typography>
                    
                    {errorInfo && (
                      <Box 
                        component="pre" 
                        sx={{ 
                          mt: 2,
                          p: 1,
                          bgcolor: 'grey.100',
                          borderRadius: 1,
                          overflow: 'auto',
                          fontSize: 12,
                          maxHeight: 200
                        }}
                      >
                        {errorInfo.componentStack}
                      </Box>
                    )}
                  </Alert>
                )}
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    // When there's no error, render children normally
    return children;
  }
}

export default ErrorBoundary;