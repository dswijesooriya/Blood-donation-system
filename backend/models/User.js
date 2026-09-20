// Import mongoose to define schemas and interact with MongoDB
const mongoose = require('mongoose');

// Create a new schema that defines the structure of a User document
const userSchema = new mongoose.Schema(
  {
    // Store the user's full name as a required string
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    // Store the NIC (National ID) as a unique required string
    nic: {
      type: String,
      required: [true, 'NIC is required'],
      unique: true,
      trim: true,
    },
    // Store the user's age with min and max validation rules
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Must be at least 18'],
      max: [65, 'Must be at most 65'],
    },
    // Store the district name as a required string
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    // Store the user's weight with a minimum value constraint
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [50, 'Must weigh at least 50kg'],
    },
    // Store the contact number and validate it is exactly 10 digits
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      match: [/^\d{10}$/, 'Contact number must be exactly 10 digits'],
    },
    // Store the email as a unique, lowercase, validated string
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    // Store the hashed password and hide it from queries by default
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // Never return password by default
    },
    // Store the blood type and restrict it to valid blood groups
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood type is required'],
    },
    // Store the user's role, defaulting to DONOR
    role: {
      type: String,
      default: 'DONOR',
      enum: ['DONOR'],
    },
    // Track whether the user is currently eligible to donate
    isEligible: {
      type: Boolean,
      default: true,
    },
    // Store the date of the user's last donation
    lastDonationDate: {
  type: Date,
  default: null,
},
// Computed on login + when marking donation:
// true if 90+ days have passed since lastDonationDate (or never donated)
isEligible: {
  type: Boolean,
  default: true,
},
// Array of all past donation records
donationHistory: [
  {
    date: { type: Date, required: true },
    hospitalName: { type: String },
    unitsDonated: { type: Number, default: 1 },
    responseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonorResponse',
    },
  },
],
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Export the User model so it can be used in controllers
module.exports = mongoose.model('User', userSchema);