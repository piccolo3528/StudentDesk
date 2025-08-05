import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff, HowToReg as RegisterIcon } from '@mui/icons-material';
import useAuth from '../../context/useAuth';
import Alert from '../../components/utils/Alert';

const steps = ['Account Type', 'Basic Information', 'Additional Details'];

const Register = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    role: '',
    // Student specific fields
    university: '',
    department: '',
    rollNumber: '',
    // Provider specific fields
    businessName: '',
    description: '',
    type: 'individual',
    cuisine: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleNext = () => {
    if (activeStep === 0 && !formData.role) {
      setLocalError('Please select an account type');
      return;
    }
    
    if (activeStep === 1) {
      // Validate step 2 fields
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone || !formData.address) {
        setLocalError('Please fill in all required fields');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
      
      if (formData.password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }
    }
    
    setLocalError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate role selection
    if (!formData.role) {
      setLocalError('Please select an account type (Student or Provider)');
      return;
    }
    
    // Validate final step fields
    if (formData.role === 'student') {
      if (!formData.university || !formData.department || !formData.rollNumber) {
        setLocalError('Please fill in all required student information');
        return;
      }
    } else if (formData.role === 'provider') {
      if (!formData.businessName || !formData.description) {
        setLocalError('Please fill in all required provider information');
        return;
      }
    }
    
    setLoading(true);
    setLocalError('');
    
    try {
      // Remove confirmPassword from data sent to API
      const { confirmPassword, ...registerData } = formData;
      
      // Special handling for provider registration
      if (formData.role === 'provider') {
        // Make sure cuisine is processed correctly
        if (formData.cuisine) {
          registerData.cuisine = formData.cuisine.split(',').map(item => item.trim());
        } else {
          registerData.cuisine = []; // Provide empty array if no cuisine
        }
        
        // Double check role is set correctly
        registerData.role = 'provider';
        
        // Set default rating of 0 for new providers
        registerData.rating = 0;
        
        console.log('Provider registration data:', registerData);
      } else {
        // Ensure student role is explicitly set
        registerData.role = 'student';
      }
      
      const result = await register(registerData);
      console.log('Registration completed with result:', result);
      
      // Check for successful registration in different response formats
      if (result) {
        // If we have a success flag in the response
        if (result.success === true) {
          navigate('/');
        }
        // If we have a token in the response
        else if (result.token) {
          navigate('/');
        }
        // If we have a user/data object in the response
        else if (result.user || result.data) {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // More detailed error for providers
      if (formData.role === 'provider') {
        console.error('Provider registration failed with data:', formData);
        
        if (err.response && err.response.data) {
          setLocalError(err.response.data.message || 'Provider registration failed');
        } else {
          setLocalError('Provider registration failed. Please ensure all required fields are filled correctly.');
        }
      } else {
        setLocalError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset" required>
              <FormLabel component="legend">Select Account Type</FormLabel>
              <RadioGroup
                name="role"
                value={formData.role}
                onChange={handleChange}
                sx={{ mt: 2 }}
              >
                <FormControlLabel
                  value="student"
                  control={<Radio />}
                  label="Student - Find and subscribe to meal providers"
                />
                <FormControlLabel
                  value="provider"
                  control={<Radio />}
                  label="Provider - Offer meal plans to students"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="address"
                  label="Address"
                  name="address"
                  autoComplete="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return formData.role === 'student' ? (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="university"
                  label="University/College"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="department"
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="rollNumber"
                  label="Roll Number / Student ID"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="businessName"
                  label="Business Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="description"
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset" required>
                  <FormLabel component="legend">Business Type</FormLabel>
                  <RadioGroup
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    row
                  >
                    <FormControlLabel
                      value="individual"
                      control={<Radio />}
                      label="Individual"
                    />
                    <FormControlLabel
                      value="company"
                      control={<Radio />}
                      label="Company"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="cuisine"
                  label="Cuisine Types (comma separated)"
                  name="cuisine"
                  placeholder="E.g. North Indian, South Indian, Chinese"
                  value={formData.cuisine}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 8,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
          Create an Account
        </Typography>

        <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {(error || localError) && (
          <Alert
            severity="error"
            message={localError || error}
            open={!!(error || localError)}
            onClose={clearError}
          />
        )}

        <Box component="form" sx={{ mt: 1, width: '100%' }}>
          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={<RegisterIcon />}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            ) : (
              <Button 
                variant="contained" 
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>

        <Grid container justifyContent="flex-end" sx={{ mt: 3 }}>
          <Grid item>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign in
            </Link>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Register; 