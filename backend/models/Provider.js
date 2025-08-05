const mongoose = require('mongoose');
const User = require('./User');

const providerSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Please provide your business name'],
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  type: {
    type: String,
    enum: ['individual', 'company'],
    default: 'individual',
  },
  cuisine: [String],
  establishedDate: {
    type: Date,
  },
  rating: {
    type: Number,
    max: [5, 'Rating cannot be more than 5'],
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  menu: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
    },
  ],
  mealPlans: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealPlan',
    },
  ],
  subscribers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
  ],
  deliveryAreas: [String],
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    branchCode: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  readyForVerification: {
    type: Boolean,
    default: false,
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot be more than 1000 characters'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Provider = User.discriminator('Provider', providerSchema);

module.exports = Provider; 