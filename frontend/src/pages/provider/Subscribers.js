import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';
import axios from 'axios';
import Loader from '../../components/utils/Loader';
import Alert from '../../components/utils/Alert';

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const [subscribersRes, statsRes] = await Promise.all([
          axios.get('/provider/subscribers'),
          axios.get('/provider/stats')
        ]);
        
        setSubscribers(subscribersRes.data.data);
        setStats(statsRes.data.data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch subscribers:', err);
        setError('Failed to load subscribers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <Loader message="Loading subscribers..." />;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Subscribers
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your meal plan subscribers and view subscription details.
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          message={error} 
          open={!!error}
          onClose={() => setError('')}
        />
      )}
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Subscribers
              </Typography>
              <Typography variant="h3" color="primary">
                {stats.totalSubscribers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Subscribers
              </Typography>
              <Typography variant="h3" color="success.main">
                {stats.activeSubscribers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h3" color="secondary.main">
                ₹{stats.revenue}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {subscribers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Subscribers Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You don't have any subscribers yet. Create attractive meal plans to attract students.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.href = '/provider/meal-plans'}
          >
            Manage Meal Plans
          </Button>
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Meal Plan</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscribers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((subscription) => (
                    <TableRow key={subscription._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={subscription.student?.profilePicture} 
                            alt={subscription.student?.name}
                            sx={{ mr: 2 }}
                          />
                          <Box>
                            <Typography variant="body1">
                              {subscription.student?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {subscription.student?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{subscription.mealPlan?.name}</TableCell>
                      <TableCell>{new Date(subscription.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(subscription.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>₹{subscription.mealPlan?.price}</TableCell>
                      <TableCell>
                        <Chip 
                          label={subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)} 
                          color={subscription.status === 'active' ? 'success' : 
                                subscription.status === 'completed' ? 'info' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={subscribers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Container>
  );
};

export default Subscribers; 