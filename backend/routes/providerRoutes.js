const express = require('express');
const router = express.Router();
const {
  updateProfile,
  createMealPlan,
  getMealPlans,
  createMenuItem,
  getMenuItems,
  getSubscribers,
  getOrders,
  updateOrderStatus,
  getProviderStats
} = require('../controllers/providerController');
const { protect, authorize } = require('../middlewares/auth');

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('provider'));

// Routes
router.put('/profile', updateProfile);
router.post('/meal-plans', createMealPlan);
router.get('/meal-plans', getMealPlans);
router.post('/menu-items', createMenuItem);
router.get('/menu-items', getMenuItems);
router.get('/subscribers', getSubscribers);
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Dashboard stats
router.get('/stats', getProviderStats);

module.exports = router; 