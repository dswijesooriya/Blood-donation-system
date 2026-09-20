// Import mongoose to define schemas and interact with MongoDB
const mongoose = require('mongoose');

// Create a new schema that defines the structure of a Hospital document
const hospitalSchema = new mongoose.Schema(
  {
    // Store the hospital's name as a required string
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    // Store the hospital's registration ID as a unique required string
    registrationId: {
      type: String,
      required: [true, 'Hospital registration ID is required'],
      unique: true,
      trim: true,
    },
    // Store the district name as a required string
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    // Store the official email as a unique, lowercase, validated string
    officialEmail: {
      type: String,
      required: [true, 'Official email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    // Store the contact number and validate it is exactly 10 digits
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      match: [/^\d{10}$/, 'Contact number must be exactly 10 digits'],
    },
    // Store the hashed password and hide it from queries by default
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    // Store the role, restricted to HOSPITAL only
    role: {
      type: String,
      default: 'HOSPITAL',
      enum: ['HOSPITAL'],
    },
    // Store the approval status, defaulting to PENDING
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Export the Hospital model so it can be used in controllers
module.exports = mongoose.model('Hospital', hospitalSchema);