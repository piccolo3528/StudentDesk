const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a plan name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price must be positive'],
    },
    duration: {
      type: Number,
      required: [true, 'Please provide duration in days'],
      min: [1, 'Duration must be at least 1 day'],
    },
    mealOptions: {
      breakfast: {
        available: {
          type: Boolean,
          default: false,
        },
        items: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
          },
        ],
      },
      lunch: {
        available: {
          type: Boolean,
          default: true,
        },
        items: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
          },
        ],
      },
      dinner: {
        available: {
          type: Boolean,
          default: true,
        },
        items: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
          },
        ],
      },
    },
    dietaryOptions: {
      vegetarian: {
        type: Boolean,
        default: false,
      },
      vegan: {
        type: Boolean,
        default: false,
      },
      nonVegetarian: {
        type: Boolean,
        default: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    deliverySchedule: {
      breakfast: { time: String },
      lunch: { time: String },
      dinner: { time: String },
    },
    weeklyMenu: {
      monday: {
        breakfast: { type: String },
        lunch: { type: String },
        dinner: { type: String },
      },
      tuesday: {
        breakfast: { type: String },
        lunch: { type: String },
        dinner: { type: String },
      },
      wednesday: {
        breakfast: { type: String },
        lunch: { type: String },
        dinner: { type: String },
      },
      thursday: {
        breakfast: { type: String },
        lunch: { type: String },
        dinner: { type: String },
      },
      friday: {
        breakfast: { type: String },
        lunch: { type: String },
        dinner: { type: String },
      },
      saturday: {
        breakfast: { type: String },
        lunch: { type: String },
        dinner: { type: String },
      },
      sunday: {
        breakfast: { type: String },
        lunch: { type: String },
        dinner: { type: String },
      },
    },
  },
  { timestamps: true }
);

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

module.exports = MealPlan; 