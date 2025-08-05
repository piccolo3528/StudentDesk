import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  InputLabel,
  Stack,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestaurantMenu as MenuIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import axios from 'axios';
import Loader from '../../components/utils/Loader';
import Alert from '../../components/utils/Alert';

const MealPlans = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successAlert, setSuccessAlert] = useState('');
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: 30,
    mealOptions: {
      breakfast: { available: false, time: '08:00-09:00' },
      lunch: { available: true, time: '12:00-13:00' },
      dinner: { available: true, time: '19:00-20:00' }
    },
    dietaryOptions: {
      vegetarian: true,
      vegan: false,
      nonVegetarian: true
    },
    isActive: true
  });

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/provider/meal-plans');
      setMealPlans(res.data.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch meal plans:', err);
      setError('Failed to load meal plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, plan = null) => {
    if (mode === 'edit' && plan) {
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        duration: plan.duration || 30,
        mealOptions: {
          breakfast: plan.mealOptions?.breakfast || { available: false, time: '08:00-09:00' },
          lunch: plan.mealOptions?.lunch || { available: true, time: '12:00-13:00' },
          dinner: plan.mealOptions?.dinner || { available: true, time: '19:00-20:00' }
        },
        dietaryOptions: {
          vegetarian: plan.dietaryOptions?.vegetarian || false,
          vegan: plan.dietaryOptions?.vegan || false,
          nonVegetarian: plan.dietaryOptions?.nonVegetarian || false
        },
        isActive: plan.isActive !== undefined ? plan.isActive : true
      });
      setSelectedPlan(plan);
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: 30,
        mealOptions: {
          breakfast: { available: false, time: '08:00-09:00' },
          lunch: { available: true, time: '12:00-13:00' },
          dinner: { available: true, time: '19:00-20:00' }
        },
        dietaryOptions: {
          vegetarian: true,
          vegan: false,
          nonVegetarian: true
        },
        isActive: true
      });
      setSelectedPlan(null);
    }
    
    setDialogMode(mode);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setFormData({
        ...formData,
        price: value
      });
    }
  };

  const handleMealOptionChange = (meal, field, value) => {
    setFormData({
      ...formData,
      mealOptions: {
        ...formData.mealOptions,
        [meal]: {
          ...formData.mealOptions[meal],
          [field]: value
        }
      }
    });
  };

  const handleDietaryOptionChange = (option, value) => {
    setFormData({
      ...formData,
      dietaryOptions: {
        ...formData.dietaryOptions,
        [option]: value
      }
    });
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.name || !formData.description || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }
    
    setDialogLoading(true);
    
    try {
      if (dialogMode === 'create') {
        await axios.post('/provider/meal-plans', formData);
        setSuccessAlert('Meal plan created successfully');
      } else {
        await axios.put(`/provider/meal-plans/${selectedPlan._id}`, formData);
        setSuccessAlert('Meal plan updated successfully');
      }
      
      // Refresh meal plans list
      await fetchMealPlans();
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to submit meal plan:', err);
      setError(err.response?.data?.message || 'Failed to save meal plan. Please try again.');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleOpenDeleteDialog = (plan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPlanToDelete(null);
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      await axios.delete(`/provider/meal-plans/${planToDelete._id}`);
      setSuccessAlert('Meal plan deleted successfully');
      
      // Refresh meal plans list
      await fetchMealPlans();
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Failed to delete meal plan:', err);
      setError(err.response?.data?.message || 'Failed to delete meal plan. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && mealPlans.length === 0) {
    return <Loader message="Loading meal plans..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Meal Plans
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('create')}
          >
            Create New Plan
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your meal plans and subscriptions. Create new plans, edit existing ones, or delete plans that are no longer offered.
        </Typography>
        
        {error && (
          <Alert
            severity="error"
            message={error}
            open={!!error}
            onClose={() => setError('')}
          />
        )}
        
        {successAlert && (
          <Alert
            severity="success"
            message={successAlert}
            open={!!successAlert}
            onClose={() => setSuccessAlert('')}
          />
        )}
        
        {mealPlans.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
            <MenuIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Meal Plans Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You haven't created any meal plans yet. Create your first meal plan to start receiving subscriptions.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('create')}
            >
              Create First Plan
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {mealPlans.map((plan) => (
              <Grid item xs={12} md={6} key={plan._id}>
                <Card elevation={2} sx={{ height: '100%', position: 'relative' }}>
                  {!plan.isActive && (
                    <Chip
                      label="Inactive"
                      color="error"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 1
                      }}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                      {plan.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" color="primary">
                        ₹{plan.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {plan.duration} days
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {plan.description}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Meal Options:
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {plan.mealOptions?.breakfast?.available && (
                        <Chip
                          label={`Breakfast (${plan.mealOptions.breakfast.time})`}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                      {plan.mealOptions?.lunch?.available && (
                        <Chip
                          label={`Lunch (${plan.mealOptions.lunch.time})`}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                      {plan.mealOptions?.dinner?.available && (
                        <Chip
                          label={`Dinner (${plan.mealOptions.dinner.time})`}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                    </Box>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Dietary Options:
                    </Typography>
                    <Box>
                      {plan.dietaryOptions?.vegetarian && (
                        <Chip
                          label="Vegetarian"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                      {plan.dietaryOptions?.vegan && (
                        <Chip
                          label="Vegan"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                      {plan.dietaryOptions?.nonVegetarian && (
                        <Chip
                          label="Non-Vegetarian"
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleOpenDeleteDialog(plan)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog('edit', plan)}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New Meal Plan' : 'Edit Meal Plan'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (₹)"
                name="price"
                value={formData.price}
                onChange={handlePriceChange}
                required
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="duration-label">Duration (days)</InputLabel>
                <Select
                  labelId="duration-label"
                  value={formData.duration}
                  name="duration"
                  label="Duration (days)"
                  onChange={handleInputChange}
                >
                  <MenuItem value={7}>7 days</MenuItem>
                  <MenuItem value={15}>15 days</MenuItem>
                  <MenuItem value={30}>30 days</MenuItem>
                  <MenuItem value={60}>60 days</MenuItem>
                  <MenuItem value={90}>90 days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    color="primary"
                  />
                }
                label="Active"
                sx={{ mt: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormLabel component="legend">Meal Options</FormLabel>
                <FormGroup>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Paper elevation={2} sx={{ p: 2 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={formData.mealOptions.breakfast.available}
                                onChange={(e) => handleMealOptionChange('breakfast', 'available', e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Breakfast"
                          />
                          <TextField
                            fullWidth
                            label="Time"
                            value={formData.mealOptions.breakfast.time}
                            onChange={(e) => handleMealOptionChange('breakfast', 'time', e.target.value)}
                            disabled={!formData.mealOptions.breakfast.available}
                            margin="normal"
                            size="small"
                          />
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper elevation={2} sx={{ p: 2 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={formData.mealOptions.lunch.available}
                                onChange={(e) => handleMealOptionChange('lunch', 'available', e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Lunch"
                          />
                          <TextField
                            fullWidth
                            label="Time"
                            value={formData.mealOptions.lunch.time}
                            onChange={(e) => handleMealOptionChange('lunch', 'time', e.target.value)}
                            disabled={!formData.mealOptions.lunch.available}
                            margin="normal"
                            size="small"
                          />
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper elevation={2} sx={{ p: 2 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={formData.mealOptions.dinner.available}
                                onChange={(e) => handleMealOptionChange('dinner', 'available', e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Dinner"
                          />
                          <TextField
                            fullWidth
                            label="Time"
                            value={formData.mealOptions.dinner.time}
                            onChange={(e) => handleMealOptionChange('dinner', 'time', e.target.value)}
                            disabled={!formData.mealOptions.dinner.available}
                            margin="normal"
                            size="small"
                          />
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                </FormGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormLabel component="legend">Dietary Options</FormLabel>
                <FormGroup sx={{ flexDirection: 'row', mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.dietaryOptions.vegetarian}
                        onChange={(e) => handleDietaryOptionChange('vegetarian', e.target.checked)}
                        color="success"
                      />
                    }
                    label="Vegetarian"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.dietaryOptions.vegan}
                        onChange={(e) => handleDietaryOptionChange('vegan', e.target.checked)}
                        color="success"
                      />
                    }
                    label="Vegan"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.dietaryOptions.nonVegetarian}
                        onChange={(e) => handleDietaryOptionChange('nonVegetarian', e.target.checked)}
                        color="error"
                      />
                    }
                    label="Non-Vegetarian"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={dialogLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={dialogLoading}
          >
            {dialogLoading ? 'Saving...' : (dialogMode === 'create' ? 'Create' : 'Update')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Meal Plan</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the meal plan "{planToDelete?.name}"? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Note: Deleting a meal plan will not affect existing subscriptions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeletePlan} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MealPlans; 