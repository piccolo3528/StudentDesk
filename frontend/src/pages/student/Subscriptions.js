import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Rating,
  LinearProgress,
  Tabs,
  Tab,
  Paper,
  Avatar
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  LocalDining as DiningIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  CheckCircle as ActiveIcon,
  DoNotDisturb as InactiveIcon
} from '@mui/icons-material';
import axios from 'axios';
import Loader from '../../components/utils/Loader';
import Alert from '../../components/utils/Alert';

// Fallback image for providers
const DEFAULT_IMAGE = 'https://via.placeholder.com/100x100/e0e0e0/757575?text=Provider';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`subscription-tabpanel-${index}`}
      aria-labelledby={`subscription-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Subscriptions = () => {
  const navigate = useNavigate();
  
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  
  const [successAlert, setSuccessAlert] = useState('');
  const [errorAlert, setErrorAlert] = useState('');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await axios.get('/students/subscriptions');
        setSubscriptions(res.data.data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch subscriptions:', err);
        setError('Failed to load your subscriptions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenCancelDialog = (subscription) => {
    setSelectedSubscription(subscription);
    setCancelDialogOpen(true);
    setCancellationReason('');
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setSelectedSubscription(null);
  };

  const handleCancellationReasonChange = (e) => {
    setCancellationReason(e.target.value);
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    
    try {
      await axios.post(`/students/subscriptions/${selectedSubscription._id}/cancel`, {
        reason: cancellationReason
      });
      
      // Update the subscription status locally
      setSubscriptions(prevSubscriptions =>
        prevSubscriptions.map(sub =>
          sub._id === selectedSubscription._id ? { ...sub, status: 'cancelled' } : sub
        )
      );
      
      setSuccessAlert('Subscription cancelled successfully');
      handleCloseCancelDialog();
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      setErrorAlert(err.response?.data?.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleOpenReviewDialog = (subscription) => {
    setSelectedSubscription(subscription);
    setReview({ rating: 0, comment: '' });
    setReviewDialogOpen(true);
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setSelectedSubscription(null);
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReview(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (event, newValue) => {
    setReview(prev => ({ ...prev, rating: newValue }));
  };

  const handleSubmitReview = async () => {
    if (review.rating === 0) {
      setErrorAlert('Please provide a rating');
      return;
    }
    
    setReviewSubmitLoading(true);
    
    try {
      await axios.post(`/students/providers/${selectedSubscription.provider._id}/reviews`, {
        rating: review.rating,
        comment: review.comment,
        subscriptionId: selectedSubscription._id
      });
      
      // Update the subscription to show review has been submitted
      setSubscriptions(prevSubscriptions =>
        prevSubscriptions.map(sub =>
          sub._id === selectedSubscription._id ? { ...sub, reviewed: true } : sub
        )
      );
      
      setSuccessAlert('Review submitted successfully');
      handleCloseReviewDialog();
    } catch (err) {
      console.error('Failed to submit review:', err);
      setErrorAlert(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const getSubscriptionProgress = (subscription) => {
    if (subscription.status !== 'active') return 100;
    
    const startDate = new Date(subscription.startDate);
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    
    if (today < startDate) return 0;
    if (today > endDate) return 100;
    
    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const daysElapsed = (today - startDate) / (1000 * 60 * 60 * 24);
    
    return Math.min(Math.round((daysElapsed / totalDays) * 100), 100);
  };

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const inactiveSubscriptions = subscriptions.filter(sub => sub.status !== 'active');

  // Common handler for image loading errors
  const handleImageError = (e) => {
    e.target.src = DEFAULT_IMAGE;
  };

  if (loading) {
    return <Loader message="Loading your subscriptions..." />;
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert 
          severity="error" 
          message={error} 
          open={!!error}
          onClose={() => setError('')}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Subscriptions
        </Typography>
        
        {subscriptions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <DiningIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Subscriptions Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You don't have any meal plan subscriptions yet.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/providers')}
            >
              Browse Providers
            </Button>
          </Paper>
        ) : (
          <>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 3 }}
            >
              <Tab 
                label={`Active (${activeSubscriptions.length})`} 
                icon={<ActiveIcon />} 
                iconPosition="start"
              />
              <Tab 
                label={`Past & Cancelled (${inactiveSubscriptions.length})`} 
                icon={<InactiveIcon />} 
                iconPosition="start"
              />
            </Tabs>
            
            {/* Active Subscriptions Tab */}
            <TabPanel value={tabValue} index={0}>
              {activeSubscriptions.length > 0 ? (
                <Grid container spacing={3}>
                  {activeSubscriptions.map((subscription) => (
                    <Grid item xs={12} key={subscription._id}>
                      <Card elevation={2}>
                        <CardContent sx={{ pb: 1 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={3} md={2}>
                              <Box sx={{ position: 'relative' }}>
                                <Avatar
                                  src={subscription.provider?.profilePicture || DEFAULT_IMAGE}
                                  alt={subscription.provider?.businessName}
                                  sx={{ width: 100, height: 100, mb: 1 }}
                                  variant="rounded"
                                  onError={handleImageError}
                                />
                                <Chip
                                  label="Active"
                                  color="success"
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                  }}
                                />
                              </Box>
                              <Typography variant="subtitle1" gutterBottom>
                                {subscription.provider?.businessName}
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => navigate(`/providers/${subscription.provider?._id}`)}
                                sx={{ mb: 1 }}
                              >
                                View Provider
                              </Button>
                            </Grid>
                            
                            <Grid item xs={12} sm={9} md={10}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <Typography variant="h6">
                                  {subscription.mealPlan?.name}
                                </Typography>
                                <Box>
                                  <Chip
                                    icon={<TimeIcon />}
                                    label={`${subscription.mealPlan?.duration} days`}
                                    variant="outlined"
                                    sx={{ mr: 1 }}
                                  />
                                  <Chip
                                    variant="outlined"
                                    color="primary"
                                    label={`₹${subscription.mealPlan?.price}`}
                                  />
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {subscription.mealPlan?.description}
                              </Typography>
                              
                              <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Subscription Details:
                                  </Typography>
                                  <Typography variant="body2">
                                    Start Date: {new Date(subscription.startDate).toLocaleDateString()}
                                  </Typography>
                                  <Typography variant="body2">
                                    End Date: {new Date(subscription.endDate).toLocaleDateString()}
                                  </Typography>
                                  <Typography variant="body2">
                                    Delivery Address: {subscription.deliveryAddress}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Meals Included:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {subscription.mealPreferences?.breakfast && (
                                      <Chip size="small" label="Breakfast" />
                                    )}
                                    {subscription.mealPreferences?.lunch && (
                                      <Chip size="small" label="Lunch" />
                                    )}
                                    {subscription.mealPreferences?.dinner && (
                                      <Chip size="small" label="Dinner" />
                                    )}
                                  </Box>
                                </Grid>
                              </Grid>
                              
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" gutterBottom>
                                  Subscription Progress:
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box sx={{ width: '100%', mr: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={getSubscriptionProgress(subscription)}
                                      sx={{ height: 8, borderRadius: 5 }}
                                    />
                                  </Box>
                                  <Box sx={{ minWidth: 35 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      {getSubscriptionProgress(subscription)}%
                                    </Typography>
                                  </Box>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {Math.round((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleOpenCancelDialog(subscription)}
                          >
                            Cancel Subscription
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    You don't have any active subscriptions.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/providers')}
                    sx={{ mt: 2 }}
                  >
                    Browse Providers
                  </Button>
                </Paper>
              )}
            </TabPanel>
            
            {/* Inactive Subscriptions Tab */}
            <TabPanel value={tabValue} index={1}>
              {inactiveSubscriptions.length > 0 ? (
                <Grid container spacing={3}>
                  {inactiveSubscriptions.map((subscription) => (
                    <Grid item xs={12} key={subscription._id}>
                      <Card elevation={1} sx={{ opacity: 0.9 }}>
                        <CardContent sx={{ pb: 1 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={3} md={2}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Avatar
                                  src={subscription.provider?.profilePicture || DEFAULT_IMAGE}
                                  alt={subscription.provider?.businessName}
                                  sx={{ width: 100, height: 100, mb: 1 }}
                                  variant="rounded"
                                  onError={handleImageError}
                                />
                                <Chip
                                  label={subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                                  color={subscription.status === 'completed' ? 'info' : 'error'}
                                  size="small"
                                  sx={{ mb: 1 }}
                                />
                                <Typography variant="subtitle1" gutterBottom align="center">
                                  {subscription.provider?.businessName}
                                </Typography>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => navigate(`/providers/${subscription.provider?._id}`)}
                                  sx={{ mb: 1 }}
                                >
                                  View Provider
                                </Button>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={9} md={10}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <Typography variant="h6">
                                  {subscription.mealPlan?.name}
                                </Typography>
                                <Box>
                                  <Chip
                                    icon={<TimeIcon />}
                                    label={`${subscription.mealPlan?.duration} days`}
                                    variant="outlined"
                                    sx={{ mr: 1 }}
                                  />
                                  <Chip
                                    variant="outlined"
                                    color="primary"
                                    label={`₹${subscription.mealPlan?.price}`}
                                  />
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {subscription.mealPlan?.description}
                              </Typography>
                              
                              <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Subscription Details:
                                  </Typography>
                                  <Typography variant="body2">
                                    Start Date: {new Date(subscription.startDate).toLocaleDateString()}
                                  </Typography>
                                  <Typography variant="body2">
                                    End Date: {new Date(subscription.endDate).toLocaleDateString()}
                                  </Typography>
                                  <Typography variant="body2">
                                    Status: {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                                  </Typography>
                                  {subscription.status === 'cancelled' && subscription.cancellationReason && (
                                    <Typography variant="body2">
                                      Cancellation Reason: {subscription.cancellationReason}
                                    </Typography>
                                  )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Meals Included:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {subscription.mealPreferences?.breakfast && (
                                      <Chip size="small" label="Breakfast" />
                                    )}
                                    {subscription.mealPreferences?.lunch && (
                                      <Chip size="small" label="Lunch" />
                                    )}
                                    {subscription.mealPreferences?.dinner && (
                                      <Chip size="small" label="Dinner" />
                                    )}
                                  </Box>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                          {subscription.status === 'completed' && !subscription.reviewed && (
                            <Button
                              variant="outlined"
                              color="primary"
                              startIcon={<StarIcon />}
                              onClick={() => handleOpenReviewDialog(subscription)}
                            >
                              Leave Review
                            </Button>
                          )}
                          {subscription.status === 'completed' && subscription.reviewed && (
                            <Chip label="Reviewed" color="success" variant="outlined" />
                          )}
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate(`/providers/${subscription.provider?._id}`)}
                          >
                            Subscribe Again
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    You don't have any past or cancelled subscriptions.
                  </Typography>
                </Paper>
              )}
            </TabPanel>
          </>
        )}
      </Box>
      
      {/* Cancel Subscription Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Cancel Subscription
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your subscription to {selectedSubscription?.mealPlan?.name} from {selectedSubscription?.provider?.businessName}?
            This action cannot be undone.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Cancellation (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={cancellationReason}
            onChange={handleCancellationReasonChange}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} disabled={cancelLoading}>
            No, Keep Subscription
          </Button>
          <Button 
            onClick={handleCancelSubscription} 
            color="error" 
            variant="contained"
            disabled={cancelLoading}
          >
            {cancelLoading ? 'Processing...' : 'Yes, Cancel Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={handleCloseReviewDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Leave a Review for {selectedSubscription?.provider?.businessName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography component="legend">Rating*</Typography>
            <Rating
              name="rating"
              value={review.rating}
              onChange={handleRatingChange}
              precision={0.5}
              size="large"
            />
          </Box>
          <TextField
            autoFocus
            margin="dense"
            name="comment"
            label="Your Review (Optional)"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={review.comment}
            onChange={handleReviewChange}
            placeholder="Share your experience with this provider..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog} disabled={reviewSubmitLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitReview}
            color="primary"
            variant="contained"
            disabled={reviewSubmitLoading || review.rating === 0}
          >
            {reviewSubmitLoading ? 'Submitting...' : 'Submit Review'}
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

export default Subscriptions; 