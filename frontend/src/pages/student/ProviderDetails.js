import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Tabs,
  Tab,
  Divider,
  Chip,
  Rating,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Alert as MuiAlert
} from '@mui/material';
import {
  RestaurantMenu as MenuIcon,
  LocalDining as MealPlanIcon,
  CommentBank as ReviewsIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import axios from 'axios';
import Loader from '../../components/utils/Loader';
import Alert from '../../components/utils/Alert';

// Fallback image for providers
const DEFAULT_IMAGE = 'https://via.placeholder.com/400x300/e0e0e0/757575?text=No+Image';

// Common handler for image loading errors
const handleImageError = (e) => {
  e.target.src = DEFAULT_IMAGE;
};

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`provider-tabpanel-${index}`}
      aria-labelledby={`provider-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ProviderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Subscription dialog state
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionFormData, setSubscriptionFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    deliveryAddress: '',
    deliveryInstructions: '',
    mealPreferences: {
      breakfast: false,
      lunch: true,
      dinner: true,
    },
    paymentMethod: 'card',
  });
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

  useEffect(() => {
    const fetchProviderDetails = async () => {
      try {
        const res = await axios.get(`/students/providers/${id}`);
        setProvider(res.data.data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch provider details:', err);
        setError('Failed to load provider details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProviderDetails();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenSubscribeDialog = (plan) => {
    setSelectedPlan(plan);
    setSubscribeDialogOpen(true);
  };

  const handleCloseSubscribeDialog = () => {
    setSubscribeDialogOpen(false);
    setSubscriptionError('');
    setSubscriptionSuccess(false);
  };

  const handleSubscriptionFormChange = (e) => {
    const { name, value } = e.target;
    setSubscriptionFormData({
      ...subscriptionFormData,
      [name]: value,
    });
  };

  const handleMealPreferenceChange = (e) => {
    const { name, checked } = e.target;
    setSubscriptionFormData({
      ...subscriptionFormData,
      mealPreferences: {
        ...subscriptionFormData.mealPreferences,
        [name]: checked,
      },
    });
  };

  const handleSubscribe = async () => {
    setSubscriptionLoading(true);
    setSubscriptionError('');
    
    try {
      await axios.post('/students/subscribe', {
        providerId: provider._id,
        mealPlanId: selectedPlan._id,
        startDate: subscriptionFormData.startDate,
        deliveryAddress: subscriptionFormData.deliveryAddress,
        deliveryInstructions: subscriptionFormData.deliveryInstructions,
        mealPreferences: subscriptionFormData.mealPreferences,
        paymentMethod: subscriptionFormData.paymentMethod,
      });
      
      setSubscriptionSuccess(true);
      
      // Close dialog after successful subscription after 2 seconds
      setTimeout(() => {
        handleCloseSubscribeDialog();
        navigate('/student/subscriptions');
      }, 2000);
    } catch (err) {
      console.error('Subscription error:', err);
      setSubscriptionError(err.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading provider details..." />;
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert 
          severity="error" 
          message={error} 
          open={!!error}
          onClose={() => navigate('/providers')}
        />
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/providers')}
            variant="contained"
          >
            Back to Providers
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/providers')}
          sx={{ mb: 2 }}
        >
          Back to Providers
        </Button>
        
        {/* Provider Header */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardMedia
                component="img"
                height="250"
                image={provider?.profilePicture || DEFAULT_IMAGE}
                alt={provider?.businessName}
                onError={handleImageError}
              />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating
                    value={provider?.rating || 0}
                    precision={0.5}
                    readOnly
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({provider?.totalReviews || 0} reviews)
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon color="primary" sx={{ mr: 1 }} fontSize="small" />
                    {provider?.address || 'Address not provided'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon color="primary" sx={{ mr: 1 }} fontSize="small" />
                    Business Hours
                  </Typography>
                  
                  {provider?.businessHours && Object.entries(provider.businessHours).map(([day, hours]) => (
                    hours.open && (
                      <Typography variant="body2" key={day} sx={{ ml: 3, fontSize: '0.85rem' }}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}: {hours.open} - {hours.close || 'Closed'}
                      </Typography>
                    )
                  ))}
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cuisine Types
                  </Typography>
                  <Box>
                    {provider?.cuisine?.map((type, idx) => (
                      <Chip
                        key={idx}
                        label={type}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {provider?.businessName}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              {provider?.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2 }}
            >
              <Tab icon={<MealPlanIcon />} label="Meal Plans" />
              <Tab icon={<MenuIcon />} label="Menu Items" />
              <Tab icon={<ReviewsIcon />} label="Reviews" />
            </Tabs>
            
            {/* Meal Plans Tab */}
            <TabPanel value={tabValue} index={0}>
              {provider?.mealPlans?.length > 0 ? (
                <Grid container spacing={3}>
                  {provider.mealPlans.map((plan) => (
                    <Grid item xs={12} sm={6} key={plan._id}>
                      <Card elevation={2} sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {plan.name}
                          </Typography>
                          
                          <Typography variant="body2" paragraph>
                            {plan.description}
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Duration: {plan.duration} days
                            </Typography>
                            
                            <Typography variant="subtitle2" gutterBottom>
                              Meals included:
                            </Typography>
                            
                            <Box sx={{ ml: 2 }}>
                              {plan.mealOptions?.breakfast?.available && (
                                <Typography variant="body2">- Breakfast</Typography>
                              )}
                              {plan.mealOptions?.lunch?.available && (
                                <Typography variant="body2">- Lunch</Typography>
                              )}
                              {plan.mealOptions?.dinner?.available && (
                                <Typography variant="body2">- Dinner</Typography>
                              )}
                            </Box>
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Dietary Options:
                              </Typography>
                              <Box sx={{ ml: 2 }}>
                                {plan.dietaryOptions?.vegetarian && (
                                  <Typography variant="body2">- Vegetarian</Typography>
                                )}
                                {plan.dietaryOptions?.vegan && (
                                  <Typography variant="body2">- Vegan</Typography>
                                )}
                                {plan.dietaryOptions?.nonVegetarian && (
                                  <Typography variant="body2">- Non-Vegetarian</Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h5" color="primary">
                              ₹{plan.price}
                            </Typography>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenSubscribeDialog(plan)}
                            >
                              Subscribe
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No meal plans available for this provider.
                  </Typography>
                </Box>
              )}
            </TabPanel>
            
            {/* Menu Items Tab */}
            <TabPanel value={tabValue} index={1}>
              {provider?.menu?.length > 0 ? (
                <Grid container spacing={3}>
                  {provider.menu.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                      <Card elevation={2} sx={{ height: '100%' }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={item.image || DEFAULT_IMAGE}
                          alt={item.name}
                          onError={handleImageError}
                        />
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {item.name}
                          </Typography>
                          
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              height: '60px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {item.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" color="primary">
                              ₹{item.price}
                            </Typography>
                            <Chip
                              label={item.category}
                              size="small"
                              color="secondary"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No menu items available for this provider.
                  </Typography>
                </Box>
              )}
            </TabPanel>
            
            {/* Reviews Tab */}
            <TabPanel value={tabValue} index={2}>
              {provider?.reviews?.length > 0 ? (
                <List>
                  {provider.reviews.map((review, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <Avatar
                          sx={{ mr: 2, bgcolor: 'primary.main' }}
                          alt={review.student?.name || 'User'}
                        >
                          {review.student?.name?.charAt(0) || 'U'}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1">
                                {review.student?.name || 'Anonymous User'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(review.date).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Rating
                                value={review.rating}
                                precision={0.5}
                                readOnly
                                size="small"
                                sx={{ my: 1 }}
                              />
                              <Typography variant="body2" color="text.primary">
                                {review.comment || 'No comment provided.'}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < provider.reviews.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No reviews available for this provider.
                  </Typography>
                </Box>
              )}
            </TabPanel>
          </Grid>
        </Grid>
      </Box>
      
      {/* Subscription Dialog */}
      <Dialog
        open={subscribeDialogOpen}
        onClose={handleCloseSubscribeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Subscribe to {selectedPlan?.name}
        </DialogTitle>
        <DialogContent>
          {subscriptionSuccess ? (
            <MuiAlert severity="success" sx={{ mt: 2 }}>
              Subscription successful! Redirecting to your subscriptions...
            </MuiAlert>
          ) : (
            <>
              {subscriptionError && (
                <MuiAlert severity="error" sx={{ mt: 2, mb: 2 }}>
                  {subscriptionError}
                </MuiAlert>
              )}
              
              <Typography variant="body2" sx={{ mt: 2 }}>
                Please fill in the subscription details:
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={subscriptionFormData.startDate}
                    onChange={handleSubscriptionFormChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Delivery Address"
                    name="deliveryAddress"
                    multiline
                    rows={2}
                    value={subscriptionFormData.deliveryAddress}
                    onChange={handleSubscriptionFormChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Delivery Instructions (Optional)"
                    name="deliveryInstructions"
                    multiline
                    rows={2}
                    value={subscriptionFormData.deliveryInstructions}
                    onChange={handleSubscriptionFormChange}
                    placeholder="E.g., Leave at door, call when arrived, etc."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Meal Preferences
                  </Typography>
                  <FormControl component="fieldset">
                    <FormControlLabel
                      control={
                        <Radio
                          checked={subscriptionFormData.mealPreferences.breakfast}
                          onChange={(e) => handleMealPreferenceChange({ target: { name: 'breakfast', checked: e.target.checked } })}
                          name="breakfast"
                        />
                      }
                      label="Breakfast"
                    />
                    <FormControlLabel
                      control={
                        <Radio
                          checked={subscriptionFormData.mealPreferences.lunch}
                          onChange={(e) => handleMealPreferenceChange({ target: { name: 'lunch', checked: e.target.checked } })}
                          name="lunch"
                        />
                      }
                      label="Lunch"
                    />
                    <FormControlLabel
                      control={
                        <Radio
                          checked={subscriptionFormData.mealPreferences.dinner}
                          onChange={(e) => handleMealPreferenceChange({ target: { name: 'dinner', checked: e.target.checked } })}
                          name="dinner"
                        />
                      }
                      label="Dinner"
                    />
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Payment Method
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      name="paymentMethod"
                      value={subscriptionFormData.paymentMethod}
                      onChange={handleSubscriptionFormChange}
                    >
                      <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
                      <FormControlLabel value="upi" control={<Radio />} label="UPI" />
                      <FormControlLabel value="wallet" control={<Radio />} label="Digital Wallet" />
                      <FormControlLabel value="cash" control={<Radio />} label="Cash on Delivery" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseSubscribeDialog} disabled={subscriptionLoading || subscriptionSuccess}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubscribe} 
            variant="contained" 
            color="primary"
            disabled={subscriptionLoading || subscriptionSuccess}
          >
            {subscriptionLoading ? 'Processing...' : 'Subscribe'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProviderDetails; 