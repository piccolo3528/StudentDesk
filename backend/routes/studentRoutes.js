const express = require('express');
const router = express.Router();
const {
  getProviders,
  getProviderDetails,
  subscribe,
  getSubscriptions,
  createReview,
  getOrders,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middlewares/auth');

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('student'));

// Routes
router.get('/providers', getProviders);
router.get('/providers/:id', getProviderDetails);
router.post('/subscribe', subscribe);
router.get('/subscriptions', getSubscriptions);
router.post('/reviews/:providerId', createReview);
router.get('/orders', getOrders);

module.exports = router; 