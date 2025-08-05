import React, { useState, useEffect } from 'react';
import { Alert as MuiAlert, Snackbar, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const Alert = ({ 
  severity = 'info', 
  message, 
  open, 
  onClose,
  autoHideDuration = 6000 
}) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <MuiAlert
        elevation={6}
        variant="filled"
        severity={severity}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default Alert; 