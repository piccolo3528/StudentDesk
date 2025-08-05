import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        padding: 4,
      }}
    >
      <CircularProgress size={60} thickness={4} color="primary" />
      <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
        {message}
      </Typography>
    </Box>
  );
};

export default Loader; 