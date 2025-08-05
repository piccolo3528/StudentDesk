import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  VerifiedUser as VerifiedIcon,
  ErrorOutline as PendingIcon,
  CheckCircleOutline as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const VerificationStatus = ({ isVerified, requirementsCompleted }) => {
  // Default to 0 if requirementsCompleted is not provided
  const completedRequirements = requirementsCompleted || 0;
  
  // Requirements list for verification
  const requirements = [
    'Complete business profile',
    'Add at least one meal plan',
    'Add at least 5 menu items',
    'Provide bank account details',
    'Submit address verification'
  ];
  
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {isVerified ? (
          <VerifiedIcon color="success" sx={{ fontSize: 36, mr: 2 }} />
        ) : (
          <PendingIcon color="warning" sx={{ fontSize: 36, mr: 2 }} />
        )}
        
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            Verification Status
          </Typography>
          <Chip 
            label={isVerified ? 'Verified' : 'Pending Verification'} 
            color={isVerified ? 'success' : 'warning'}
            size="small"
          />
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {isVerified ? (
        <Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            Your business is verified! Verified providers appear higher in search results and 
            gain student trust with the verified badge.
          </Typography>
          <Button 
            component={Link} 
            to="/provider/subscribers" 
            variant="contained" 
            color="primary"
            size="small"
            sx={{ mt: 1 }}
          >
            Manage Subscribers
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            Complete the following requirements to get verified. Verified providers 
            appear higher in search results and attract more subscribers.
          </Typography>
          
          <List dense sx={{ mb: 2 }}>
            {requirements.map((requirement, index) => (
              <ListItem key={index}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {index < completedRequirements ? (
                    <CheckIcon color="success" fontSize="small" />
                  ) : (
                    <CancelIcon color="action" fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={requirement}
                  sx={{ 
                    textDecoration: index < completedRequirements ? 'line-through' : 'none',
                    color: index < completedRequirements ? 'text.secondary' : 'text.primary'
                  }}
                />
              </ListItem>
            ))}
          </List>
          
          <Typography variant="body2" color="text.secondary">
            {completedRequirements}/{requirements.length} requirements completed
          </Typography>
          
          <Button 
            component={Link} 
            to="/profile" 
            variant="contained" 
            color="primary"
            size="small"
            sx={{ mt: 2 }}
          >
            Complete Profile
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default VerificationStatus; 