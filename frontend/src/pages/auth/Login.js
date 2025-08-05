import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Link, 
  Paper, 
  Grid,
  InputAdornment,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Login as LoginIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import AuthDebugger from '../../components/utils/AuthDebugger';
import LoginAlternative from '../../components/auth/LoginAlternative';

const Login = () => {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showDebugger, setShowDebugger] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [useAlternative, setUseAlternative] = useState(false);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');
    setErrorDetails(null);
    
    try {
      const { email, password } = formData;
      const result = await login({ email, password });
      console.log('Login completed with result:', result);
      
      // Check for successful login in different response formats
      if (result) {
        if (result.success === true || result.token || result.user || result.data) {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Save detailed error information for debugging
      setErrorDetails({
        message: err.message,
        displayMessage: err.displayMessage,
        status: err.status || err.response?.status,
        endpoint: err.endpoint || err.config?.url,
        data: err.data || err.response?.data
      });
      
      // Show user-friendly error message
      setLocalError(err.displayMessage || err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleDebugger = () => {
    setShowDebugger(!showDebugger);
  };
  
  const toggleLoginMethod = () => {
    setUseAlternative(!useAlternative);
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
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
          <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
            Welcome Back
          </Typography>
          <IconButton 
            color={showDebugger ? 'primary' : 'default'} 
            onClick={toggleDebugger}
            size="small"
            sx={{ mb: 2 }}
          >
            <BugIcon />
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to continue to Student Mess
        </Typography>
        
        {/* Debugger section */}
        {showDebugger && (
          <>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1">Debug Tools</Typography>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={toggleLoginMethod}
              >
                {useAlternative ? 'Use Standard Login' : 'Use Alternative Login'}
              </Button>
            </Box>
            {useAlternative ? (
              <LoginAlternative />
            ) : (
              <AuthDebugger />
            )}
            <Divider sx={{ my: 2, width: '100%' }}>
              <Chip label="Standard Login Form" />
            </Divider>
          </>
        )}
        
        {(error || localError) && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            <Typography variant="body2">{localError || error}</Typography>
            
            {errorDetails && (
              <Accordion sx={{ mt: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="caption">Error Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box 
                    component="pre" 
                    sx={{ 
                      fontSize: '0.75rem', 
                      overflow: 'auto',
                      maxHeight: 150
                    }}
                  >
                    {JSON.stringify(errorDetails, null, 2)}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
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
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
            startIcon={<LoginIcon />}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <Grid container justifyContent="space-between">
            <Grid item>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 