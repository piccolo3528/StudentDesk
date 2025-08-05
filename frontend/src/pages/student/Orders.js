import React, { useState, useEffect } from 'react';
import {
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Chip,
  Button
} from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import axios from 'axios';
import Loader from '../../components/utils/Loader';
import Alert from '../../components/utils/Alert';

const DEFAULT_IMAGE = 'https://via.placeholder.com/400x300/e0e0e0/757575?text=No+Image';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/students/orders');
        setOrders(res.data.data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <Loader message="Loading your orders..." />;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and track your meal orders.
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          message={error} 
          open={!!error}
          onClose={() => setError('')}
        />
      )}
      
      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Orders Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You don't have any orders yet. Subscribe to a meal plan to start receiving meals.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">
                          Order #{order.orderNumber}
                        </Typography>
                        <Chip 
                          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" gutterBottom>
                        Provider: {order.provider?.businessName}
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        Date: {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        Delivery Address: {order.deliveryAddress}
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        Items: {order.items?.map(item => item.name).join(', ')}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <Typography variant="h6" color="primary">
                        ₹{order.totalAmount}
                      </Typography>
                      
                      <Button 
                        variant="outlined" 
                        size="small"
                        disabled={order.status !== 'pending'}
                        color="error"
                        sx={{ mt: 2 }}
                      >
                        {order.status === 'pending' ? 'Cancel Order' : 'View Details'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Orders; 