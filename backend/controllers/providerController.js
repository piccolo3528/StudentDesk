const Provider = require('../models/Provider');
const MealPlan = require('../models/MealPlan');
const MenuItem = require('../models/MenuItem');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// @desc    Update provider profile
// @route   PUT /api/providers/profile
// @access  Private (Provider)
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      businessName,
      description,
      type,
      cuisine,
      deliveryAreas,
      businessHours,
      bankDetails,
      bio
    } = req.body;

    const updatedFields = {};

    // Basic fields
    if (name) updatedFields.name = name;
    if (phone) updatedFields.phone = phone;
    if (address) updatedFields.address = address;
    if (bio) updatedFields.bio = bio;
    
    // Provider-specific fields
    if (businessName) updatedFields.businessName = businessName;
    if (description) updatedFields.description = description;
    if (type) updatedFields.type = type;
    
    // Handle array fields
    if (cuisine) {
      updatedFields.cuisine = Array.isArray(cuisine) ? cuisine : JSON.parse(cuisine);
    }
    
    if (deliveryAreas) {
      updatedFields.deliveryAreas = Array.isArray(deliveryAreas) ? deliveryAreas : JSON.parse(deliveryAreas);
    }
    
    // Handle object fields
    if (businessHours) {
      updatedFields.businessHours = typeof businessHours === 'object' ? 
        businessHours : JSON.parse(businessHours);
    }
    
    if (bankDetails) {
      updatedFields.bankDetails = typeof bankDetails === 'object' ? 
        bankDetails : JSON.parse(bankDetails);
    }

    const provider = await Provider.findByIdAndUpdate(
      req.user.id,
      updatedFields,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    // Check if the provider has completed enough info to be marked for verification
    const requiredFields = [
      'name', 'phone', 'address', 'businessName', 
      'description', 'bankDetails.accountNumber'
    ];
    
    const isComplete = requiredFields.every(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return provider[parent] && provider[parent][child];
      }
      return !!provider[field];
    });
    
    // Check if they have menu items and meal plans
    const hasMenuItems = provider.menu && provider.menu.length >= 5;
    const hasMealPlans = provider.mealPlans && provider.mealPlans.length > 0;
    
    // If profile is complete, update the ready for verification flag
    if (isComplete && hasMenuItems && hasMealPlans && !provider.verified) {
      provider.readyForVerification = true;
      await provider.save();
    }

    res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not update profile',
      error: error.message,
    });
  }
};

// @desc    Create a meal plan
// @route   POST /api/providers/meal-plans
// @access  Private (Provider)
exports.createMealPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      duration,
      mealOptions,
      dietaryOptions,
      deliverySchedule,
      weeklyMenu,
    } = req.body;

    // Set provider ID from authenticated user
    req.body.provider = req.user.id;

    // Create meal plan
    const mealPlan = await MealPlan.create({
      provider: req.user.id,
      name,
      description,
      price,
      duration,
      mealOptions: mealOptions || {
        breakfast: { available: false, items: [] },
        lunch: { available: true, items: [] },
        dinner: { available: true, items: [] },
      },
      dietaryOptions: dietaryOptions || {
        vegetarian: false,
        vegan: false,
        nonVegetarian: true,
      },
      deliverySchedule: deliverySchedule || {
        breakfast: { time: '08:00 AM' },
        lunch: { time: '12:30 PM' },
        dinner: { time: '07:30 PM' },
      },
      weeklyMenu: weeklyMenu || {},
    });

    // Add to provider's meal plans
    await Provider.findByIdAndUpdate(req.user.id, {
      $push: { mealPlans: mealPlan._id },
    });

    res.status(201).json({
      success: true,
      data: mealPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not create meal plan',
      error: error.message,
    });
  }
};

// @desc    Get provider's meal plans
// @route   GET /api/providers/meal-plans
// @access  Private (Provider)
exports.getMealPlans = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({ provider: req.user.id });

    res.status(200).json({
      success: true,
      count: mealPlans.length,
      data: mealPlans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch meal plans',
      error: error.message,
    });
  }
};

// @desc    Create a menu item
// @route   POST /api/providers/menu-items
// @access  Private (Provider)
exports.createMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      image,
      ingredients,
      nutritionalInfo,
      dietaryType,
      allergens,
      preparationTime,
    } = req.body;

    // Create menu item
    const menuItem = await MenuItem.create({
      provider: req.user.id,
      name,
      description,
      category,
      price,
      image: image || 'https://via.placeholder.com/300',
      ingredients: ingredients || [],
      nutritionalInfo: nutritionalInfo || {},
      dietaryType: dietaryType || {
        vegetarian: false,
        vegan: false,
        nonVegetarian: true,
      },
      allergens: allergens || [],
      preparationTime: preparationTime || 30,
    });

    // Add to provider's menu
    await Provider.findByIdAndUpdate(req.user.id, {
      $push: { menu: menuItem._id },
    });

    res.status(201).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not create menu item',
      error: error.message,
    });
  }
};

// @desc    Get provider's menu items
// @route   GET /api/providers/menu-items
// @access  Private (Provider)
exports.getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ provider: req.user.id });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch menu items',
      error: error.message,
    });
  }
};

// @desc    Get provider's subscribers
// @route   GET /api/providers/subscribers
// @access  Private (Provider)
exports.getSubscribers = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      provider: req.user.id,
      status: 'active',
    }).populate({
      path: 'student',
      select: 'name email phone address',
    }).populate('mealPlan');

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch subscribers',
      error: error.message,
    });
  }
};

// @desc    Get provider's orders
// @route   GET /api/providers/orders
// @access  Private (Provider)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ provider: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'student',
        select: 'name phone address',
      })
      .populate({
        path: 'items.menuItem',
        select: 'name price',
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch orders',
      error: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/providers/orders/:id
// @access  Private (Provider)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Validate status
    const validStatuses = [
      'confirmed',
      'preparing',
      'ready',
      'out-for-delivery',
      'delivered',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if provider owns this order
    if (order.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order',
      });
    }

    // Update status
    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not update order status',
      error: error.message,
    });
  }
};

// @desc    Get provider stats for dashboard
// @route   GET /api/providers/stats
// @access  Private (Provider)
exports.getProviderStats = async (req, res) => {
  try {
    // Get basic provider info
    const provider = await Provider.findById(req.user.id);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Initialize stats with default values
    let stats = {
      revenue: 0,
      totalSubscribers: 0,
      activeSubscribers: 0,
      totalOrders: 0,
      pendingOrders: 0,
      rating: provider.rating || 0,
      totalReviews: provider.totalReviews || 0,
      totalMenuItems: 0,
      totalMealPlans: 0
    };
    
    try {
      // Get subscription stats if Subscription model exists
      if (typeof Subscription !== 'undefined') {
        const subscriptions = await Subscription.find({ 
          provider: req.user.id
        });
        
        const activeSubscriptions = await Subscription.find({ 
          provider: req.user.id,
          status: 'active' 
        });
        
        stats.totalSubscribers = subscriptions.length;
        stats.activeSubscribers = activeSubscriptions.length;
        
        // Calculate subscription revenue
        const subscriptionRevenue = await Subscription.aggregate([
          { $match: { provider: mongoose.Types.ObjectId(req.user.id) } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        if (subscriptionRevenue.length > 0) {
          stats.revenue += subscriptionRevenue[0].total;
        }
      }
    } catch (err) {
      console.error('Error fetching subscription stats:', err.message);
    }
    
    try {
      // Get order stats if Order model exists
      if (typeof Order !== 'undefined') {
        // Get total orders and pending orders
        stats.totalOrders = await Order.countDocuments({ provider: req.user.id });
        stats.pendingOrders = await Order.countDocuments({ 
          provider: req.user.id,
          status: { $in: ['pending', 'preparing', 'ready_for_pickup'] }
        });
        
        // Calculate order revenue
        const orderRevenue = await Order.aggregate([
          { $match: { provider: mongoose.Types.ObjectId(req.user.id) } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        
        if (orderRevenue.length > 0) {
          stats.revenue += orderRevenue[0].total;
        }
      }
    } catch (err) {
      console.error('Error fetching order stats:', err.message);
    }
    
    try {
      // Count menu items if MenuItem model exists
      if (typeof MenuItem !== 'undefined') {
        stats.totalMenuItems = await MenuItem.countDocuments({ provider: req.user.id });
      }
    } catch (err) {
      console.error('Error fetching menu items count:', err.message);
    }
    
    try {
      // Count meal plans if MealPlan model exists
      if (typeof MealPlan !== 'undefined') {
        stats.totalMealPlans = await MealPlan.countDocuments({ provider: req.user.id });
      }
    } catch (err) {
      console.error('Error fetching meal plans count:', err.message);
    }
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Provider stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not fetch provider statistics',
      error: error.message,
    });
  }
}; 