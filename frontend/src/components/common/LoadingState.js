import React from 'react';
import {
  Box,
  CircularProgress,
  Skeleton,
  Typography,
  Paper
} from '@mui/material';

/**
 * Component for displaying loading states with various options
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether content is loading
 * @param {React.ReactNode} props.children - Content to display when not loading
 * @param {string} props.variant - Loading variant (skeleton, spinner, overlay)
 * @param {number} props.height - Height of the loading container (for skeletons)
 * @param {string} props.message - Optional message to display during loading
 * @param {Object} props.skeletonProps - Props to pass to Skeleton component
 * @param {number} props.count - Number of skeleton items to render
 */
const LoadingState = ({
  loading,
  children,
  variant = 'skeleton',
  height = 200,
  message = 'Loading...',
  skeletonProps = {},
  count = 1
}) => {
  // Return children immediately if not loading
  if (!loading) {
    return children;
  }

  // Skeleton list loading (for content lists, menus, etc)
  if (variant === 'skeleton-list') {
    return (
      <Box>
        {Array.from(new Array(count)).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={60}
            sx={{ mb: 1, borderRadius: 1 }}
            animation="wave"
            {...skeletonProps}
          />
        ))}
      </Box>
    );
  }

  // Skeleton card loading (for dashboards, cards, etc)
  if (variant === 'skeleton-card') {
    return (
      <Box>
        {Array.from(new Array(count)).map((_, index) => (
          <Paper
            key={index}
            elevation={1}
            sx={{ p: 2, mb: 2, borderRadius: 1 }}
          >
            <Skeleton animation="wave" height={30} width="50%" sx={{ mb: 1 }} />
            <Skeleton animation="wave" height={20} width="80%" sx={{ mb: 1 }} />
            <Skeleton animation="wave" height={20} width="70%" sx={{ mb: 1 }} />
            
            <Box sx={{ display: 'flex', mt: 2 }}>
              <Skeleton animation="wave" height={30} width={80} />
              <Box sx={{ flexGrow: 1 }} />
              <Skeleton animation="wave" height={30} width={40} />
            </Box>
          </Paper>
        ))}
      </Box>
    );
  }

  // Standard skeleton loading
  if (variant === 'skeleton') {
    return (
      <Box sx={{ width: '100%' }}>
        <Skeleton
          variant="rectangular"
          height={height}
          animation="wave"
          {...skeletonProps}
        />
      </Box>
    );
  }

  // Text with spinner loading
  if (variant === 'spinner') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Box>
    );
  }

  // Overlay loading (for blocking operations)
  if (variant === 'overlay') {
    return (
      <Box sx={{ position: 'relative', minHeight: height }}>
        {children}
        
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 10
          }}
        >
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Fallback for unknown variants
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default LoadingState; 