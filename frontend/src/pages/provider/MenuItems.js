import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  InputAdornment,
  Paper,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import axios from 'axios';
import Loader from '../../components/utils/Loader';
import Alert from '../../components/utils/Alert';
import useAuth from '../../context/useAuth';

const MenuItems = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successAlert, setSuccessAlert] = useState('');
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'main-course',
    image: null,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  });
  
  // Category options
  const categories = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'starter', label: 'Starter' },
    { value: 'main-course', label: 'Main Course' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'beverage', label: 'Beverage' }
  ];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/provider/menu-items');
      setMenuItems(res.data.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
      setError('Failed to load menu items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, item = null) => {
    if (mode === 'edit' && item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category || 'main-course',
        image: item.image || null,
        isVegetarian: item.isVegetarian || false,
        isVegan: item.isVegan || false,
        isGlutenFree: item.isGlutenFree || false
      });
      setSelectedItem(item);
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'main-course',
        image: null,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false
      });
      setSelectedItem(null);
    }
    
    setDialogMode(mode);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: reader.result
        });
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    setDialogLoading(true);
    
    try {
      if (dialogMode === 'create') {
        await axios.post('/provider/menu-items', formData);
        setSuccessAlert('Menu item created successfully');
      } else {
        await axios.put(`/provider/menu-items/${selectedItem._id}`, formData);
        setSuccessAlert('Menu item updated successfully');
      }
      
      // Refresh menu items list
      await fetchMenuItems();
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to submit menu item:', err);
      setError(err.response?.data?.message || 'Failed to save menu item. Please try again.');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleOpenDeleteDialog = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      await axios.delete(`/provider/menu-items/${itemToDelete._id}`);
      setSuccessAlert('Menu item deleted successfully');
      
      // Refresh menu items list
      await fetchMenuItems();
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Failed to delete menu item:', err);
      setError(err.response?.data?.message || 'Failed to delete menu item. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && menuItems.length === 0) {
    return <Loader message="Loading menu items..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Menu Items
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('create')}
          >
            Add New Item
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your menu items. Add new dishes, edit existing ones, or remove items that are no longer offered.
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
        
        {menuItems.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
            <RestaurantIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Menu Items Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You haven't added any menu items yet. Add your first dish to showcase your culinary offerings.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('create')}
            >
              Add First Item
            </Button>
          </Paper>
        ) : (
          /* eslint-disable-next-line */
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {menuItems.map((item) => (
              /* eslint-disable-next-line */
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image || `https://source.unsplash.com/random/300x200/?food&sig=${item._id}`}
                    alt={item.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {item.name}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ₹{item.price}
                      </Typography>
                    </Box>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        height: '60px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        mb: 2
                      }}
                    >
                      {item.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      <Chip
                        label={categories.find(cat => cat.value === item.category)?.label || 'Main Course'}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                      {item.isVegetarian && (
                        <Chip
                          label="Vegetarian"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                      {item.isVegan && (
                        <Chip
                          label="Vegan"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                      {item.isGlutenFree && (
                        <Chip
                          label="Gluten-Free"
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleOpenDeleteDialog(item)}
                    >
                      Delete
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog('edit', item)}
                      sx={{ ml: 'auto' }}
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
          {dialogMode === 'create' ? 'Add New Menu Item' : 'Edit Menu Item'}
        </DialogTitle>
        <DialogContent>
          {/* eslint-disable-next-line */}
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {/* eslint-disable-next-line */}
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
            {/* eslint-disable-next-line */}
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
            {/* eslint-disable-next-line */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={formData.category}
                  name="category"
                  label="Category"
                  onChange={handleInputChange}
                >
                  {categories.map((category) => (
                    <MuiMenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MuiMenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* eslint-disable-next-line */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.isVegetarian}
                          onChange={handleInputChange}
                          name="isVegetarian"
                          color="success"
                        />
                      }
                      label="Vegetarian"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.isVegan}
                          onChange={handleInputChange}
                          name="isVegan"
                          color="success"
                        />
                      }
                      label="Vegan"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.isGlutenFree}
                          onChange={handleInputChange}
                          name="isGlutenFree"
                          color="info"
                        />
                      }
                      label="Gluten-Free"
                    />
                  </Box>
                </FormControl>
              </Box>
            </Grid>
            {/* eslint-disable-next-line */}
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
            {/* eslint-disable-next-line */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
                Item Image
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {formData.image && (
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      overflow: 'hidden',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <img
                      src={formData.image}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                )}
              </Box>
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
            {dialogLoading ? 'Saving...' : (dialogMode === 'create' ? 'Add Item' : 'Update Item')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Menu Item</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteItem} 
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

export default MenuItems; 