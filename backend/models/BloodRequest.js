// Import mongoose to define schemas and interact with MongoDB
const mongoose = require('mongoose');

// Create a new schema that defines the structure of a BloodRequest document
const bloodRequestSchema = new mongoose.Schema(
  {
    // Reference to the Hospital that created this request
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    // Store the required blood type, restricted to valid blood groups
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    // Store the number of blood units needed, minimum 1
    unitsNeeded: {
      type: Number,
      required: true,
      min: 1,
    },
    // Store the district where the blood is needed
    district: {
      type: String,
      required: true,
      trim: true,
    },
    // Store the urgency level, defaulting to low
    urgencyStatus: {
      type: String,
      enum: ['low', 'critical'],
      default: 'low',
    },
    // Store the contact number for this request
    contactNumber: {
      type: String,
      required: true,
    },
    // Track whether the request has been fulfilled
    isFulfilled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Export the BloodRequest model so it can be used in controllers
module.exports = mongoose.model('BloodRequest', bloodRequestSchema);