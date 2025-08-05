const User = require('../models/User');
const Provider = require('../models/Provider');
const Student = require('../models/Student');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    // Get user based on their role
    let userData;
    
    if (req.user.role === 'provider') {
      userData = await Provider.findById(req.user.id).select('-password');
    } else if (req.user.role === 'student') {
      userData = await Student.findById(req.user.id).select('-password');
    } else {
      userData = await User.findById(req.user.id).select('-password');
    }

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Could not fetch profile',
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      bio,
      // Provider specific fields
      businessName,
      description,
      type,
      cuisine,
      deliveryAreas,
      businessHours,
      bankDetails
    } = req.body;

    const updatedFields = {};

    // Basic fields
    if (name) updatedFields.name = name;
    if (phone) updatedFields.phone = phone;
    if (address) updatedFields.address = address;
    if (bio) updatedFields.bio = bio;
    
    let user;
    
    // Check user role and update accordingly
    if (req.user.role === 'provider') {
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
      
      user = await Provider.findByIdAndUpdate(
        req.user.id,
        updatedFields,
        {
          new: true,
          runValidators: true,
        }
      ).select('-password');
      
      // Check if the provider has completed enough info to be marked for verification
      if (user && !user.verified) {
        const requiredFields = [
          'name', 'phone', 'address', 'businessName', 
          'description', 'bankDetails.accountNumber'
        ];
        
        const isComplete = requiredFields.every(field => {
          if (field.includes('.')) {
            const [parent, child] = field.split('.');
            return user[parent] && user[parent][child];
          }
          return !!user[field];
        });
        
        // Check if they have menu items and meal plans
        if (isComplete && user.menu && user.menu.length >= 5 && 
            user.mealPlans && user.mealPlans.length > 0) {
          user.readyForVerification = true;
          await user.save();
        }
      }
    } else if (req.user.role === 'student') {
      user = await Student.findByIdAndUpdate(
        req.user.id,
        updatedFields,
        {
          new: true,
          runValidators: true,
        }
      ).select('-password');
    } else {
      user = await User.findByIdAndUpdate(
        req.user.id,
        updatedFields,
        {
          new: true,
          runValidators: true,
        }
      ).select('-password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Could not update profile',
      error: error.message,
    });
  }
};

// @desc    Update user password
// @route   PUT /api/user/password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user model based on role
    let userModel;
    if (req.user.role === 'provider') {
      userModel = Provider;
    } else if (req.user.role === 'student') {
      userModel = Student;
    } else {
      userModel = User;
    }
    
    // Find user
    const user = await userModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Could not update password',
      error: error.message,
    });
  }
}; 