const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    mealPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealPlan',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled', 'expired'],
      default: 'active',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'wallet'],
    },
    paymentDetails: {
      transactionId: String,
      paymentDate: Date,
    },
    mealPreferences: {
      breakfast: {
        type: Boolean,
        default: false,
      },
      lunch: {
        type: Boolean,
        default: true,
      },
      dinner: {
        type: Boolean,
        default: true,
      },
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    deliveryInstructions: String,
    preferredDeliveryTime: {
      breakfast: String,
      lunch: String,
      dinner: String,
    },
    skippedDates: [Date],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    renewalReminder: {
      type: Boolean,
      default: true,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    daysRemaining: {
      type: Number,
      default: function () {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(
          (this.endDate - new Date()) / oneDay
        );
      },
    },
  },
  { timestamps: true }
);

// Calculate days remaining on find
subscriptionSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'mealPlan',
    select: 'name description price duration',
  });
  next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription; 