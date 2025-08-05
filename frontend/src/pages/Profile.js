import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as CameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import useAuth from '../context/useAuth';
import axios from 'axios';
import Alert from '../components/utils/Alert';
import Loader from '../components/utils/Loader';

// Default image for avatar when profilePicture is not available
const DEFAULT_PROFILE_IMAGE = '';

const Profile = () => {
  const { user, updateUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    businessName: '',
    type: 'individual',
    description: '',
    cuisine: '',
    deliveryAreas: '',
    businessHours: {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' }
    },
    bankDetails: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      branchCode: ''
    }
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);
  
  const [successAlert, setSuccessAlert] = useState('');
  const [errorAlert, setErrorAlert] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await axios.get('/api/user/profile');
        setProfileData(res.data.data);
        setFormData({
          name: res.data.data.name,
          email: res.data.data.email,
          phone: res.data.data.phone || '',
          address: res.data.data.address || '',
          bio: res.data.data.bio || '',
          businessName: res.data.data.businessName || '',
          type: res.data.data.type || 'individual',
          description: res.data.data.description || '',
          cuisine: res.data.data.cuisine?.join(', ') || '',
          deliveryAreas: res.data.data.deliveryAreas?.join(', ') || '',
          businessHours: res.data.data.businessHours || {
            monday: { open: '', close: '' },
            tuesday: { open: '', close: '' },
            wednesday: { open: '', close: '' },
            thursday: { open: '', close: '' },
            friday: { open: '', close: '' },
            saturday: { open: '', close: '' },
            sunday: { open: '', close: '' }
          },
          bankDetails: res.data.data.bankDetails || {
            accountName: '',
            accountNumber: '',
            bankName: '',
            branchCode: ''
          }
        });
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
        setErrorAlert('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      
      if (subChild) {
        // Handle deeply nested fields like businessHours.monday.open
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: {
              ...formData[parent]?.[child],
              [subChild]: value
            }
          }
        });
      } else {
        // Handle nested fields like bankDetails.accountName
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: value
          }
        });
      }
    } else {
      // Handle flat fields
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Only set form data if profileData exists
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        bio: profileData.bio || '',
        businessName: profileData.businessName || '',
        type: profileData.type || 'individual',
        description: profileData.description || '',
        cuisine: profileData.cuisine?.join(', ') || '',
        deliveryAreas: profileData.deliveryAreas?.join(', ') || '',
        businessHours: profileData.businessHours || {
          monday: { open: '', close: '' },
          tuesday: { open: '', close: '' },
          wednesday: { open: '', close: '' },
          thursday: { open: '', close: '' },
          friday: { open: '', close: '' },
          saturday: { open: '', close: '' },
          sunday: { open: '', close: '' }
        },
        bankDetails: profileData.bankDetails || {
          accountName: '',
          accountNumber: '',
          bankName: '',
          branchCode: ''
        }
      });
    }
    setIsEditing(false);
  };

  const handleUpdateProfile = async () => {
    setProfileUpdateLoading(true);
    
    try {
      // Prepare data for submission
      const dataToSubmit = { ...formData };
      
      // Convert comma-separated strings to arrays for provider-specific fields
      if (profileData && profileData.role === 'provider') {
        // Convert cuisine string to array
        if (dataToSubmit.cuisine) {
          dataToSubmit.cuisine = dataToSubmit.cuisine.split(',').map(item => item.trim()).filter(Boolean);
        } else {
          dataToSubmit.cuisine = [];
        }
        
        // Convert deliveryAreas string to array
        if (dataToSubmit.deliveryAreas) {
          dataToSubmit.deliveryAreas = dataToSubmit.deliveryAreas.split(',').map(item => item.trim()).filter(Boolean);
        } else {
          dataToSubmit.deliveryAreas = [];
        }

        // Ensure business hours and bank details are properly initialized
        if (!dataToSubmit.businessHours) {
          dataToSubmit.businessHours = {
            monday: { open: '', close: '' },
            tuesday: { open: '', close: '' },
            wednesday: { open: '', close: '' },
            thursday: { open: '', close: '' },
            friday: { open: '', close: '' },
            saturday: { open: '', close: '' },
            sunday: { open: '', close: '' }
          };
        }

        if (!dataToSubmit.bankDetails) {
          dataToSubmit.bankDetails = {
            accountName: '',
            accountNumber: '',
            bankName: '',
            branchCode: ''
          };
        }
      }
      
      // Call the API
      const res = await axios.put('/api/user/profile', dataToSubmit);
      
      // Update local state with the response data
      if (res?.data?.data) {
        setProfileData(res.data.data);
        updateUser(res.data.data);
        setIsEditing(false);
        setSuccessAlert('Profile updated successfully');
      } else {
        throw new Error('Invalid response data');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrorAlert(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handleOpenPasswordDialog = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordDialogOpen(true);
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
  };

  const handleUpdatePassword = async () => {
    // Validation
    if (!passwordData.currentPassword) {
      setErrorAlert('Current password is required');
      return;
    }

    if (!passwordData.newPassword) {
      setErrorAlert('New password is required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorAlert('New password and confirm password do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setErrorAlert('New password must be at least 6 characters long');
      return;
    }
    
    setPasswordUpdateLoading(true);
    
    try {
      const response = await axios.put('/api/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response?.data?.success) {
        setSuccessAlert('Password updated successfully');
        handleClosePasswordDialog();
      } else {
        throw new Error('Failed to update password');
      }
    } catch (err) {
      console.error('Failed to update password:', err);
      setErrorAlert(err.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setPasswordUpdateLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading profile..." />;
  }

  // Safety check - if profileData is null after loading, show an error
  if (!profileData) {
    return (
      <Container maxWidth="md">
        <Alert
          severity="error"
          message="Failed to load profile data. Please refresh the page and try again."
          open={true}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        My Profile
      </Typography>
      
      <Grid container spacing={4}>
        {/* Left Column - Profile Picture and Details */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={profileData?.profilePicture || DEFAULT_PROFILE_IMAGE}
                alt={profileData?.name || 'User'}
                sx={{ width: 150, height: 150, mb: 2, mx: 'auto' }}
              >
                {!profileData?.profilePicture && <PersonIcon sx={{ fontSize: 80 }} />}
              </Avatar>
              {isEditing && (
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: 0,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <input hidden accept="image/*" type="file" />
                  <CameraIcon />
                </IconButton>
              )}
            </Box>
            
            <Typography variant="h5" gutterBottom>
              {profileData?.name || 'User'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {profileData?.email || 'No email available'}
            </Typography>
            
            <Chip
              label={`Role: ${(profileData?.role || 'user').charAt(0).toUpperCase() + (profileData?.role || 'user').slice(1)}`}
              color="primary"
              variant="outlined"
              sx={{ mt: 1 }}
            />
            
            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleOpenPasswordDialog}
                fullWidth
                sx={{ mb: 2 }}
              >
                Change Password
              </Button>
              
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditProfile}
                  fullWidth
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                    color="error"
                    fullWidth
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleUpdateProfile}
                    color="primary"
                    fullWidth
                    disabled={profileUpdateLoading}
                  >
                    {profileUpdateLoading ? <CircularProgress size={24} /> : 'Save'}
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Member Since"
                  secondary={profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Unknown'}
                />
              </ListItem>
              {profileData?.role === 'student' && (
                <>
                  <ListItem>
                    <ListItemText
                      primary="Active Subscriptions"
                      secondary={profileData.activeSubscriptions || '0'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Total Orders"
                      secondary={profileData.totalOrders || '0'}
                    />
                  </ListItem>
                </>
              )}
              {profileData?.role === 'provider' && (
                <>
                  <ListItem>
                    <ListItemText
                      primary="Active Subscribers"
                      secondary={profileData.activeSubscribers || '0'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Total Meal Plans"
                      secondary={profileData.totalMealPlans || '0'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Rating"
                      secondary={`${profileData.rating || '0'} (${profileData.totalReviews || '0'} reviews)`}
                    />
                  </ListItem>
                </>
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* Right Column - Personal Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleFormChange}
                  disabled={!isEditing}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleFormChange}
                  disabled={true} // Email is usually not editable
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleFormChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleFormChange}
                  disabled={!isEditing}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleFormChange}
                  disabled={!isEditing}
                  multiline
                  rows={4}
                  placeholder="Tell us a bit about yourself..."
                />
              </Grid>
            </Grid>
          </Paper>
          
          {profileData?.role === 'provider' && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Business Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    name="businessName"
                    value={formData.businessName || ''}
                    onChange={handleFormChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Business Type"
                    name="type"
                    value={formData.type || 'individual'}
                    onChange={handleFormChange}
                    disabled={!isEditing}
                    select
                  >
                    <MenuItem value="individual">Individual</MenuItem>
                    <MenuItem value="company">Company</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleFormChange}
                    disabled={!isEditing}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Cuisine Types (comma separated)"
                    name="cuisine"
                    value={formData.cuisine || ''}
                    onChange={handleFormChange}
                    disabled={!isEditing}
                    placeholder="e.g. North Indian, Chinese, South Indian"
                    helperText="Enter cuisine types separated by commas"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Delivery Areas (comma separated)"
                    name="deliveryAreas"
                    value={formData.deliveryAreas || ''}
                    onChange={handleFormChange}
                    disabled={!isEditing}
                    placeholder="e.g. Koramangala, HSR Layout, Indiranagar"
                    helperText="Enter delivery areas separated by commas"
                  />
                </Grid>

                {/* Business Hours Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Business Hours
                  </Typography>
                  
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <Box key={day} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                      <Typography sx={{ width: '100px', textTransform: 'capitalize' }}>
                        {day}:
                      </Typography>
                      <TextField
                        size="small"
                        label="Open"
                        name={`businessHours.${day}.open`}
                        value={formData.businessHours?.[day]?.open || ''}
                        onChange={handleFormChange}
                        disabled={!isEditing}
                        sx={{ width: '120px', mr: 2 }}
                      />
                      <TextField
                        size="small"
                        label="Close"
                        name={`businessHours.${day}.close`}
                        value={formData.businessHours?.[day]?.close || ''}
                        onChange={handleFormChange}
                        disabled={!isEditing}
                        sx={{ width: '120px' }}
                      />
                    </Box>
                  ))}
                </Grid>

                {/* Bank Details Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Bank Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Account Name"
                        name="bankDetails.accountName"
                        value={formData.bankDetails?.accountName || ''}
                        onChange={handleFormChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Account Number"
                        name="bankDetails.accountNumber"
                        value={formData.bankDetails?.accountNumber || ''}
                        onChange={handleFormChange}
                        disabled={!isEditing}
                        type="password"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Bank Name"
                        name="bankDetails.bankName"
                        value={formData.bankDetails?.bankName || ''}
                        onChange={handleFormChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Branch Code"
                        name="bankDetails.branchCode"
                        value={formData.bankDetails?.branchCode || ''}
                        onChange={handleFormChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={handleClosePasswordDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  )
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} disabled={passwordUpdateLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdatePassword}
            variant="contained"
            disabled={
              passwordUpdateLoading || 
              !passwordData.currentPassword || 
              !passwordData.newPassword || 
              !passwordData.confirmPassword
            }
          >
            {passwordUpdateLoading ? <CircularProgress size={24} /> : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Alert */}
      <Alert
        severity="success"
        message={successAlert}
        open={!!successAlert}
        onClose={() => setSuccessAlert('')}
      />
      
      {/* Error Alert */}
      <Alert
        severity="error"
        message={errorAlert}
        open={!!errorAlert}
        onClose={() => setErrorAlert('')}
      />
    </Container>
  );
};

export default Profile; 