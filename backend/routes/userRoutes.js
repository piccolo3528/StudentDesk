const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updatePassword } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

// All routes here are protected
router.use(protect);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Password route
router.put('/password', updatePassword);

module.exports = router; 