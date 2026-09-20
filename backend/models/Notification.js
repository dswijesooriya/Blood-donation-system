// Import mongoose to define schemas and interact with MongoDB
const mongoose = require('mongoose');

// Create a new schema that defines the structure of a Notification document
const notificationSchema = new mongoose.Schema(
  {
    // Reference to the donor (User) who receives the notification
    recipientDonor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Reference to the BloodRequest related to this notification
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true,
    },
    // Store the notification text shown to the donor
    message: {
      type: String,
      required: true,
    },
    // Track whether the donor has read the notification
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Export the Notification model so it can be used in controllers
module.exports = mongoose.model('Notification', notificationSchema);