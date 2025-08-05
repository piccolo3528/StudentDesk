const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide an item name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    category: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'beverage'],
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price must be positive'],
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/300',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    ingredients: [String],
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
    dietaryType: {
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
    allergens: [String],
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
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
    preparationTime: {
      type: Number, // in minutes
      default: 30,
    },
  },
  { timestamps: true }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem; 