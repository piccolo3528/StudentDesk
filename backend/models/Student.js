const mongoose = require('mongoose');
const User = require('./User');

const studentSchema = new mongoose.Schema({
  university: {
    type: String,
    required: [true, 'Please provide your university name'],
  },
  department: {
    type: String,
    required: [true, 'Please provide your department'],
  },
  rollNumber: {
    type: String,
    required: [true, 'Please provide your roll number'],
  },
  preferences: {
    dietary: {
      vegetarian: { type: Boolean, default: false },
      vegan: { type: Boolean, default: false },
      nonVegetarian: { type: Boolean, default: true },
    },
    allergies: [String],
    favoriteItems: [String],
  },
  subscriptions: [
    {
      provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
      },
      plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MealPlan',
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      mealPreferences: {
        breakfast: { type: Boolean, default: false },
        lunch: { type: Boolean, default: true },
        dinner: { type: Boolean, default: true },
      },
    },
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  ],
});

const Student = User.discriminator('Student', studentSchema);

module.exports = Student; 