const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
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
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    subscriptionOrder: {
      type: Boolean,
      default: false,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    orderType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'out-for-delivery',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            'pending',
            'confirmed',
            'preparing',
            'ready',
            'out-for-delivery',
            'delivered',
            'cancelled',
          ],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
    deliveryAddress: {
      type: String,
      required: true,
    },
    deliveryInstructions: String,
    requestedDeliveryTime: Date,
    actualDeliveryTime: Date,
    ratings: {
      food: {
        type: Number,
        min: 1,
        max: 5,
      },
      service: {
        type: Number,
        min: 1,
        max: 5,
      },
      packaging: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    feedback: String,
  },
  { timestamps: true }
);

// Add pre-save hook to update status history
orderSchema.pre('save', function (next) {
  // Check if status has changed
  if (this.isModified('status')) {
    // Add to status history
    this.statusHistory.push({
      status: this.status,
      timestamp: Date.now(),
    });
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 