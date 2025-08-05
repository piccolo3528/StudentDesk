import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  CardActions,
  Button,
  Rating,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon, Restaurant as RestaurantIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../../components/utils/Loader';
import Alert from '../../components/utils/Alert';

// Fallback image for providers
const DEFAULT_IMAGE = 'https://via.placeholder.com/400x300/e0e0e0/757575?text=No+Image';

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/students/providers');
        setProviders(res.data.data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch providers:', err);
        setError('Failed to load providers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Filter providers based on search term
  const filteredProviders = providers.filter(
    (provider) =>
      provider.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (provider.cuisine && provider.cuisine.some(cuisine => 
        cuisine.toLowerCase().includes(searchTerm.toLowerCase())
      ))
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleImageError = (e) => {
    e.target.src = DEFAULT_IMAGE;
  };

  if (loading) {
    return <Loader message="Loading providers..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Meal Providers
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Browse through our verified meal providers and find the perfect meal plan for your needs.
        </Typography>

        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, description, or cuisine..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mb: 4 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {error && (
          <Alert 
            severity="error"
            message={error}
            open={!!error}
            onClose={() => setError('')}
          />
        )}

        {filteredProviders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <RestaurantIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {searchTerm 
                ? 'No providers match your search criteria. Try a different search term.' 
                : 'No providers available at the moment.'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredProviders.map((provider) => (
              <Grid item xs={12} sm={6} md={4} key={provider._id}>
                <Card 
                  elevation={3} 
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
                    height="180"
                    image={provider.profilePicture || DEFAULT_IMAGE}
                    alt={provider.businessName}
                    onError={handleImageError}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {provider.businessName}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating 
                        value={provider.rating || 0} 
                        precision={0.5} 
                        readOnly 
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({provider.totalReviews || 0} reviews)
                      </Typography>
                    </Box>
                    
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
                      {provider.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      {provider.cuisine && provider.cuisine.map((type, idx) => (
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
                  </CardContent>
                  <CardActions sx={{ p: 2 }}>
                    <Button 
                      component={Link} 
                      to={`/providers/${provider._id}`}
                      variant="contained" 
                      color="primary"
                      fullWidth
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Providers; 