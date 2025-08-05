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
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  Receipt as ReceiptIcon,
  CheckCircle as ConfirmIcon,
  Block as RejectIcon 
} from '@mui/icons-material';
import axios from 'axios';
import Loader from '../../components/utils/Loader';
import Alert from '../../components/utils/Alert';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`orders-tabpanel-${index}`}
      aria-labelledby={`orders-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successAlert, setSuccessAlert] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Status update dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/provider/orders');
      setOrders(res.data.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleOpenUpdateDialog = (order, status) => {
    setSelectedOrder(order);
    setUpdateStatus(status);
    setStatusNote('');
    setUpdateDialogOpen(true);
  };

  const handleCloseUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusNoteChange = (e) => {
    setStatusNote(e.target.value);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    
    setUpdateLoading(true);
    
    try {
      await axios.put(`/provider/orders/${selectedOrder._id}/status`, {
        status: updateStatus,
        note: statusNote
      });
      
      // Update order in the local state
      setOrders(orders.map(order =>
        order._id === selectedOrder._id
          ? { ...order, status: updateStatus, statusNote: statusNote }
          : order
      ));
      
      setSuccessAlert(`Order status updated to ${updateStatus}`);
      handleCloseUpdateDialog();
    } catch (err) {
      console.error('Failed to update order status:', err);
      setError(err.response?.data?.message || 'Failed to update order status. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'preparing':
        return 'info';
      case 'ready':
        return 'secondary';
      case 'out_for_delivery':
        return 'secondary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (tabValue === 0) return true; // All orders
    if (tabValue === 1) return ['pending', 'confirmed', 'preparing'].includes(order.status);
    if (tabValue === 2) return ['ready', 'out_for_delivery'].includes(order.status);
    if (tabValue === 3) return order.status === 'delivered';
    if (tabValue === 4) return order.status === 'cancelled';
    return true;
  });

  if (loading) {
    return <Loader message="Loading orders..." />;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Orders
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage orders from your subscribers. Update status and track deliveries.
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
      
      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Orders Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You don't have any orders yet. As students subscribe to your meal plans, orders will appear here.
          </Typography>
        </Paper>
      ) : (
        <>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All Orders" />
            <Tab label="New & Processing" />
            <Tab label="Ready & Delivery" />
            <Tab label="Delivered" />
            <Tab label="Cancelled" />
          </Tabs>
          
          <Paper>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {order.student?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.deliveryAddress}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {order.items?.map(item => item.name).join(', ')}
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>₹{order.totalAmount}</TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)} 
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {order.status === 'pending' && (
                              <>
                                <Button 
                                  size="small" 
                                  variant="outlined" 
                                  color="success"
                                  startIcon={<ConfirmIcon />}
                                  onClick={() => handleOpenUpdateDialog(order, 'confirmed')}
                                >
                                  Confirm
                                </Button>
                                <Button 
                                  size="small" 
                                  variant="outlined" 
                                  color="error"
                                  startIcon={<RejectIcon />}
                                  onClick={() => handleOpenUpdateDialog(order, 'cancelled')}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            
                            {order.status === 'confirmed' && (
                              <Button 
                                size="small" 
                                variant="outlined" 
                                color="primary"
                                onClick={() => handleOpenUpdateDialog(order, 'preparing')}
                              >
                                Mark Preparing
                              </Button>
                            )}
                            
                            {order.status === 'preparing' && (
                              <Button 
                                size="small" 
                                variant="outlined" 
                                color="primary"
                                onClick={() => handleOpenUpdateDialog(order, 'ready')}
                              >
                                Mark Ready
                              </Button>
                            )}
                            
                            {order.status === 'ready' && (
                              <Button 
                                size="small" 
                                variant="outlined" 
                                color="primary"
                                onClick={() => handleOpenUpdateDialog(order, 'out_for_delivery')}
                              >
                                Out for Delivery
                              </Button>
                            )}
                            
                            {order.status === 'out_for_delivery' && (
                              <Button 
                                size="small" 
                                variant="outlined" 
                                color="success"
                                onClick={() => handleOpenUpdateDialog(order, 'delivered')}
                              >
                                Mark Delivered
                              </Button>
                            )}
                            
                            <Button 
                              size="small" 
                              variant="outlined"
                            >
                              Details
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredOrders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </>
      )}
      
      {/* Order Status Update Dialog */}
      <Dialog
        open={updateDialogOpen}
        onClose={handleCloseUpdateDialog}
      >
        <DialogTitle>
          Update Order Status
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to mark this order as {updateStatus.replace('_', ' ')}?
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Additional Note (Optional)"
            fullWidth
            multiline
            rows={3}
            value={statusNote}
            onChange={handleStatusNoteChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdateDialog} disabled={updateLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained" 
            color="primary"
            disabled={updateLoading}
          >
            {updateLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders; 