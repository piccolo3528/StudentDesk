import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  RestaurantMenu as MenuIcon,
  EventNote as PlanIcon,
  People as PeopleIcon,
  LocalShipping as DeliveryIcon,
  Star as StarIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../../context/useAuth';
import Loader from '../../components/utils/Loader';
import Alert from '../../components/utils/Alert';
import VerificationStatus from '../../components/provider/VerificationStatus';
import ConnectionStatus from '../../components/provider/ConnectionStatus';
import APITester from '../../components/provider/APITester';

// For displaying currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [apiErrorDetails, setApiErrorDetails] = useState(null);
  
  // Stats and data
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    averageRating: 0,
    totalMenuItems: 0,
    totalMealPlans: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentSubscribers, setRecentSubscribers] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  
  // Calculate verification requirements completed
  const calculateRequirementsCompleted = () => {
    let count = 0;
    
    // Check profile completeness
    if (user.businessName && user.description && user.phone && user.address) {
      count++;
    }
    
    // Check meal plans
    if (stats.totalMealPlans > 0) {
      count++;
    }
    
    // Check menu items
    if (stats.totalMenuItems >= 5) {
      count++;
    }
    
    // Check bank details
    if (user.bankDetails && user.bankDetails.accountNumber) {
      count++;
    }
    
    // Address verification is usually a manual process
    // For now, we'll consider it incomplete unless the user is already verified
    
    return count;
  };
  
  // Function to toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setApiErrorDetails(null);

        // We would ideally have a dashboard endpoint that returns all data in one call
        // For now, we'll make multiple calls to existing endpoints
        try {
          const [ordersRes, subscribersRes, statsRes, menuItemsRes, mealPlansRes] = await Promise.all([
            axios.get('/api/providers/orders?limit=5'),
            axios.get('/api/providers/subscribers?limit=5'),
            axios.get('/api/providers/stats'),
            axios.get('/api/providers/menu-items?limit=1'),
            axios.get('/api/providers/meal-plans?limit=1')
          ]).catch(error => {
            console.error('Error in Promise.all:', error);
            throw error;
          });

          // Get recent orders
          setRecentOrders(ordersRes.data.data.slice(0, 5));
          
          // Get recent subscribers
          setRecentSubscribers(subscribersRes.data.data.slice(0, 5));
          
          // Set statistics
          setStats({
            totalRevenue: statsRes.data.data.revenue || 0,
            totalSubscribers: statsRes.data.data.totalSubscribers || 0,
            activeSubscribers: statsRes.data.data.activeSubscribers || 0,
            totalOrders: statsRes.data.data.totalOrders || 0,
            pendingOrders: statsRes.data.data.pendingOrders || 0,
            averageRating: user.rating || 0,
            totalMenuItems: menuItemsRes.data.count || 0,
            totalMealPlans: mealPlansRes.data.count || 0
          });
          
          // Get recent reviews if any
          if (user.reviews && user.reviews.length > 0) {
            setRecentReviews(user.reviews.slice(0, 3));
          }
          
          setError('');
          // Auto-enable debug mode if there's a query parameter
          if (window.location.search.includes('debug=true')) {
            setDebugMode(true);
          }
        } catch (err) {
          console.error('Failed to fetch dashboard data:', err);
          setError(`Failed to load dashboard data: ${err.message || 'Unknown error'}`);
          
          // Save detailed error info for debugging
          setApiErrorDetails({
            message: err.message,
            response: err.response?.data || 'No response data',
            status: err.response?.status || 'Network Error',
            endpoint: err.config?.url || 'Unknown endpoint',
            stack: err.stack
          });
          
          // Auto-enable debug mode on error
          setDebugMode(true);
          
          // Set default stats in case of error
          setStats({
            totalRevenue: 0,
            totalSubscribers: 0,
            activeSubscribers: 0,
            totalOrders: 0,
            pendingOrders: 0,
            averageRating: user.rating || 0,
            totalMenuItems: 0,
            totalMealPlans: 0
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
            Provider Dashboard
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            size="small"
            onClick={toggleDebugMode}
          >
            {debugMode ? 'Hide Diagnostics' : 'Debug Mode'}
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Welcome back, {user.businessName || user.name}! Here's an overview of your business performance.
        </Typography>
        
        {error && (
          <Alert 
            severity="error" 
            message={error} 
            open={!!error}
            onClose={() => setError('')}
          />
        )}
        
        {/* Debug Mode Section */}
        {debugMode && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Diagnostics
            </Typography>
            <ConnectionStatus />
            <APITester />
            
            {apiErrorDetails && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <ErrorIcon sx={{ mr: 1 }} /> API Error Details
                </Typography>
                <Typography variant="body2">Message: {apiErrorDetails.message}</Typography>
                <Typography variant="body2">Status: {apiErrorDetails.status}</Typography>
                <Typography variant="body2">Endpoint: {apiErrorDetails.endpoint}</Typography>
                <Typography variant="body2" sx={{ 
                  mt: 1, 
                  p: 1, 
                  bgcolor: 'background.paper', 
                  borderRadius: 1,
                  maxHeight: '100px',
                  overflow: 'auto'
                }}>
                  Response: {typeof apiErrorDetails.response === 'object' 
                    ? JSON.stringify(apiErrorDetails.response, null, 2) 
                    : apiErrorDetails.response}
                </Typography>
                
                {apiErrorDetails.stack && (
                  <Typography variant="body2" sx={{ 
                    mt: 1, 
                    p: 1, 
                    bgcolor: 'background.paper', 
                    borderRadius: 1,
                    maxHeight: '150px',
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap'
                  }}>
                    Stack Trace: {apiErrorDetails.stack}
                  </Typography>
                )}

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Troubleshooting Steps:
                  </Typography>
                  <ul>
                    <li>Check that your server is running with <code>npm run dev</code> in the backend directory</li>
                    <li>Verify API path is correct: {apiErrorDetails.endpoint}</li>
                    <li>Check MongoDB connection in backend/.env file</li>
                    <li>Make sure you're logged in with valid credentials</li>
                  </ul>
                </Box>
              </Paper>
            )}
          </Box>
        )}
        
        {/* Verification Status */}
        {!user.verified && (
          <VerificationStatus 
            isVerified={user.verified} 
            requirementsCompleted={calculateRequirementsCompleted()} 
          />
        )}
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Revenue Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Typography variant="h6">Revenue</Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  {formatCurrency(stats.totalRevenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total earnings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Subscribers Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Typography variant="h6">Subscribers</Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  {stats.activeSubscribers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active subscribers (Total: {stats.totalSubscribers})
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Orders Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <DeliveryIcon />
                  </Avatar>
                  <Typography variant="h6">Orders</Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  {stats.pendingOrders}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending orders (Total: {stats.totalOrders})
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Rating Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <StarIcon />
                  </Avatar>
                  <Typography variant="h6">Rating</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                    {stats.averageRating.toFixed(1)}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>/ 5</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Based on {user.totalReviews || 0} reviews
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Quick Actions */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<MenuIcon />}
                onClick={() => navigate('/provider/menu-items')}
                sx={{ justifyContent: 'flex-start', height: '100%' }}
              >
                Manage Menu
                <Typography variant="caption" sx={{ ml: 'auto', fontSize: '0.7rem', color: 'text.secondary' }}>
                  {stats.totalMenuItems} items
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<PlanIcon />}
                onClick={() => navigate('/provider/meal-plans')}
                sx={{ justifyContent: 'flex-start', height: '100%' }}
              >
                Meal Plans
                <Typography variant="caption" sx={{ ml: 'auto', fontSize: '0.7rem', color: 'text.secondary' }}>
                  {stats.totalMealPlans} plans
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/provider/subscribers')}
                sx={{ justifyContent: 'flex-start', height: '100%' }}
              >
                Subscribers
                <Typography variant="caption" sx={{ ml: 'auto', fontSize: '0.7rem', color: 'text.secondary' }}>
                  {stats.activeSubscribers} active
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<DeliveryIcon />}
                onClick={() => navigate('/provider/orders')}
                sx={{ justifyContent: 'flex-start', height: '100%' }}
              >
                Orders
                <Typography variant="caption" sx={{ ml: 'auto', fontSize: '0.7rem', color: 'text.secondary' }}>
                  {stats.pendingOrders} pending
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Recent Orders and Subscribers */}
        <Grid container spacing={4}>
          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Orders
                </Typography>
                <Button 
                  variant="text" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/provider/orders')}
                  size="small"
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {recentOrders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="text.secondary">No orders yet</Typography>
                </Box>
              ) : (
                <List>
                  {recentOrders.map((order) => (
                    <ListItem 
                      key={order._id}
                      divider
                      secondaryAction={
                        <Chip 
                          label={order.status} 
                          color={
                            order.status === 'delivered' ? 'success' : 
                            order.status === 'pending' ? 'warning' : 'info'
                          }
                          size="small"
                        />
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>{order.student?.name?.charAt(0) || 'S'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={order.student?.name || 'Student'}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" component="span" color="primary.main" sx={{ ml: 1 }}>
                              {formatCurrency(order.totalAmount)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
          
          {/* Recent Subscribers */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Subscribers
                </Typography>
                <Button 
                  variant="text" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/provider/subscribers')}
                  size="small"
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {recentSubscribers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="text.secondary">No subscribers yet</Typography>
                </Box>
              ) : (
                <List>
                  {recentSubscribers.map((subscription) => (
                    <ListItem 
                      key={subscription._id}
                      divider
                      secondaryAction={
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="primary.main">
                            {formatCurrency(subscription.mealPlan?.price || 0)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {subscription.mealPlan?.name || 'Meal Plan'}
                          </Typography>
                        </Box>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>{subscription.student?.name?.charAt(0) || 'S'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={subscription.student?.name || 'Student'}
                        secondary={
                          <Typography variant="body2" component="span">
                            Since {new Date(subscription.startDate).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Recent Reviews */}
        {recentReviews.length > 0 && (
          <Paper sx={{ p: 3, mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Reviews
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {recentReviews.map((review) => (
                <ListItem key={review._id} divider alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>{review.student?.name?.charAt(0) || 'S'}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          {review.student?.name || 'Anonymous Student'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StarIcon sx={{ color: 'warning.main', fontSize: '1rem', mr: 0.5 }} />
                          <Typography variant="body2">
                            {review.rating} / 5
                          </Typography>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {review.comment || 'No comment provided.'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {new Date(review.date).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
        
        {/* Create New Content CTAs */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ height: '100%', backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Add New Menu Item
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Expand your menu with new culinary creations. Showcase your signature dishes and attract more subscribers.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/provider/menu-items')}
                  sx={{ mt: 1 }}
                >
                  Create Menu Item
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card sx={{ height: '100%', backgroundColor: 'secondary.light', color: 'secondary.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Create Meal Plan
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Design subscription meal plans to provide consistent revenue and build loyal customer relationships.
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/provider/meal-plans')}
                  sx={{ mt: 1 }}
                >
                  Create Meal Plan
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 