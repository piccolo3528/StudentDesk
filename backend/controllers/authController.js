const User = require('../models/User');
const Student = require('../models/Student');
const Provider = require('../models/Provider');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address, role, ...otherFields } = req.body;
    
    // Debug logs
    console.log('Registration request received:', {
      name, email, role,
      otherFields: JSON.stringify(otherFields)
    });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    let newUser;

    // Create user based on role
    if (role === 'student') {
      // Validate student-specific fields
      const { university, department, rollNumber } = otherFields;
      if (!university || !department || !rollNumber) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required student information',
        });
      }

      newUser = await Student.create({
        name,
        email,
        password,
        phone,
        address,
        role,
        university,
        department,
        rollNumber,
      });
    } else if (role === 'provider') {
      // Validate provider-specific fields
      const { businessName, description, type, cuisine } = otherFields;
      if (!businessName || !description) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required provider information',
        });
      }

      newUser = await Provider.create({
        name,
        email,
        password,
        phone,
        address,
        role,
        businessName,
        description,
        type: type || 'individual',
        cuisine: cuisine || [],
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified',
      });
    }

    // Create and send token
    sendTokenResponse(newUser, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create and send token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    let user = null;

    // Fetch user with role-specific data
    if (req.user.role === 'student') {
      user = await Student.findById(req.user.id);
    } else if (req.user.role === 'provider') {
      user = await Provider.findById(req.user.id);
    } else {
      user = await User.findById(req.user.id);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch user data',
      error: error.message,
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// Helper function to create and send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      // Include additional fields based on role
      ...(user.role === 'student' ? {
        university: user.university,
        department: user.department,
        rollNumber: user.rollNumber
      } : {}),
      ...(user.role === 'provider' ? {
        businessName: user.businessName,
        description: user.description,
        type: user.type,
        cuisine: user.cuisine
      } : {})
    }
  });
}; 