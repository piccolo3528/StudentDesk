const Student = require('../models/Student');
const Provider = require('../models/Provider');
const MealPlan = require('../models/MealPlan');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');

// @desc    Get available providers
// @route   GET /api/students/providers
// @access  Private (Student)
exports.getProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ isActive: true })
      .select('name businessName description cuisine rating totalReviews deliveryAreas')
      .populate({
        path: 'reviews',
        select: 'rating comment date',
        options: { limit: 3, sort: { date: -1 } },
      });

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch providers',
      error: error.message,
    });
  }
};

// @desc    Get provider details
// @route   GET /api/students/providers/:id
// @access  Private (Student)
exports.getProviderDetails = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .select('-password -createdAt -updatedAt -bankDetails')
      .populate({
        path: 'reviews',
        select: 'rating comment date student',
        populate: {
          path: 'student',
          select: 'name',
        },
      })
      .populate('menu')
      .populate('mealPlans');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch provider details',
      error: error.message,
    });
  }
};

// @desc    Subscribe to a meal plan
// @route   POST /api/students/subscribe
// @access  Private (Student)
exports.subscribe = async (req, res) => {
  try {
    const {
      providerId,
      mealPlanId,
      startDate,
      deliveryAddress,
      deliveryInstructions,
      mealPreferences,
      paymentMethod,
    } = req.body;

    // Validate required fields
    if (!providerId || !mealPlanId || !startDate || !deliveryAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Find provider and meal plan
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    const mealPlan = await MealPlan.findById(mealPlanId);
    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found',
      });
    }

    // Calculate end date based on meal plan duration
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + mealPlan.duration);

    // Create subscription
    const subscription = await Subscription.create({
      student: req.user.id,
      provider: providerId,
      mealPlan: mealPlanId,
      startDate: start,
      endDate: end,
      totalAmount: mealPlan.price,
      paymentStatus: 'pending', // In a real app, would be updated after payment processing
      paymentMethod,
      deliveryAddress,
      deliveryInstructions: deliveryInstructions || '',
      mealPreferences: mealPreferences || {
        breakfast: mealPlan.mealOptions.breakfast.available,
        lunch: mealPlan.mealOptions.lunch.available,
        dinner: mealPlan.mealOptions.dinner.available,
      },
    });

    // Update provider's subscribers
    await Provider.findByIdAndUpdate(providerId, {
      $addToSet: { subscribers: req.user.id },
    });

    // Update student's subscriptions
    await Student.findByIdAndUpdate(req.user.id, {
      $addToSet: {
        subscriptions: {
          provider: providerId,
          plan: mealPlanId,
          startDate: start,
          endDate: end,
          isActive: true,
          mealPreferences: mealPreferences || {
            breakfast: mealPlan.mealOptions.breakfast.available,
            lunch: mealPlan.mealOptions.lunch.available,
            dinner: mealPlan.mealOptions.dinner.available,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not create subscription',
      error: error.message,
    });
  }
};

// @desc    Get student subscriptions
// @route   GET /api/students/subscriptions
// @access  Private (Student)
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      student: req.user.id,
    })
      .populate({
        path: 'provider',
        select: 'name businessName',
      })
      .populate('mealPlan');

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch subscriptions',
      error: error.message,
    });
  }
};

// @desc    Create a review for a provider
// @route   POST /api/students/reviews/:providerId
// @access  Private (Student)
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { providerId } = req.params;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5',
      });
    }

    // Check if provider exists
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    // Check if student has an active subscription with this provider
    const hasSubscription = await Subscription.findOne({
      student: req.user.id,
      provider: providerId,
      status: 'active',
    });

    if (!hasSubscription) {
      return res.status(403).json({
        success: false,
        message: 'You need an active subscription to review this provider',
      });
    }

    // Check if student has already reviewed this provider
    const alreadyReviewed = provider.reviews.find(
      (review) => review.student.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this provider',
      });
    }

    // Create review
    const review = {
      student: req.user.id,
      rating,
      comment: comment || '',
    };

    // Add review to provider
    provider.reviews.push(review);

    // Calculate new average rating
    const totalRating = provider.reviews.reduce((acc, item) => acc + item.rating, 0);
    provider.rating = totalRating / provider.reviews.length;
    provider.totalReviews = provider.reviews.length;

    await provider.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not create review',
      error: error.message,
    });
  }
};

// @desc    Get student orders
// @route   GET /api/students/orders
// @access  Private (Student)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'provider',
        select: 'name businessName',
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