// Import mongoose to define schemas and interact with MongoDB
const mongoose = require('mongoose');

// Create a new schema that defines the structure of a DonorResponse document
const donorResponseSchema = new mongoose.Schema(
  {
    // Reference to the donor (User) who responded to a request
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Reference to the BloodRequest the donor responded to
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true,
    },
    // Track the response status, defaulting to PENDING
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'],
      default: 'PENDING',
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// A donor can only respond ONCE per request
// Create a compound unique index to prevent duplicate responses
donorResponseSchema.index({ donor: 1, request: 1 }, { unique: true });

// Export the DonorResponse model so it can be used in controllers
module.exports = mongoose.model('DonorResponse', donorResponseSchema);