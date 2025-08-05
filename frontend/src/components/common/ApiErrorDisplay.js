import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  Typography,
  Chip,
  IconButton
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

/**
 * Component to display API errors with options for user actions
 * 
 * @param {Object} props - Component props
 * @param {Object} props.error - Error object to display
 * @param {Function} props.onRetry - Function to call when retry button is clicked
 * @param {Function} props.onDismiss - Function to call when dismiss button is clicked
 * @param {Boolean} props.compact - Whether to show a compact version of the error
 * @param {String} props.variant - Variant of the alert ('filled', 'outlined', 'standard')
 */
const ApiErrorDisplay = ({ 
  error,
  onRetry,
  onDismiss,
  compact = false,
  variant = 'outlined'
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  // Special handling for network errors
  const isNetworkError = !error.statusCode || error.statusCode === 0;
  const isTimeout = error.message?.includes('timeout') || error.statusCode === 408;
  const isServerError = error.statusCode >= 500;
  const isClientError = error.statusCode >= 400 && error.statusCode < 500;
  
  // Determine severity based on error type
  let severity = 'error';
  if (isTimeout || isNetworkError) {
    severity = 'warning';
  }

  // Determine title based on error type
  let title = 'Error';
  if (isNetworkError) {
    title = 'Connection Error';
  } else if (isTimeout) {
    title = 'Request Timeout';
  } else if (isServerError) {
    title = 'Server Error';
  } else if (isClientError) {
    title = 'Request Error';
  }

  // For compact mode, show minimal info
  if (compact) {
    return (
      <Alert 
        severity={severity}
        variant={variant}
        action={
          onRetry && (
            <IconButton
              color="inherit"
              size="small"
              onClick={onRetry}
              aria-label="retry"
            >
              <RefreshIcon fontSize="inherit" />
            </IconButton>
          )
        }
      >
        {error.message || 'An error occurred'}
      </Alert>
    );
  }

  return (
    <Alert
      severity={severity}
      variant={variant}
      icon={<ErrorIcon />}
      action={
        onDismiss ? (
          <Button color="inherit" size="small" onClick={onDismiss}>
            Dismiss
          </Button>
        ) : undefined
      }
      sx={{ mb: 2 }}
    >
      <AlertTitle>{title}</AlertTitle>
      
      <Typography variant="body2" gutterBottom>
        {error.message || 'An unexpected error occurred while processing your request.'}
      </Typography>
      
      {error.statusCode && (
        <Chip
          label={`Status: ${error.statusCode}`}
          size="small"
          color={isServerError ? 'error' : 'default'}
          sx={{ mb: 1, mr: 1 }}
        />
      )}
      
      {error.endpoint && (
        <Chip
          label={`Endpoint: ${error.endpoint}`}
          size="small"
          sx={{ mb: 1 }}
        />
      )}
      
      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
        {onRetry && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
        
        {error.details && (
          <Button
            size="small"
            variant="text"
            endIcon={
              <ExpandMoreIcon
                sx={{
                  transform: showDetails ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.3s'
                }}
              />
            }
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
        )}
      </Box>
      
      {error.details && (
        <Collapse in={showDetails}>
          <Box
            sx={{
              mt: 2,
              p: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              maxHeight: 200,
              overflow: 'auto'
            }}
          >
            <Typography variant="caption" component="pre" sx={{ m: 0 }}>
              {typeof error.details === 'object'
                ? JSON.stringify(error.details, null, 2)
                : String(error.details)}
            </Typography>
          </Box>
        </Collapse>
      )}
    </Alert>
  );
};

export default ApiErrorDisplay; 