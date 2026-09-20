// Import User and Hospital models to query the database
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Admin = require('../models/Admin');
// Import bcrypt for hashing passwords and jwt for creating tokens
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load JWT secret and expiry from environment, with fallback values
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ============ DONOR REGISTRATION ============
// Controller function to register a new donor
exports.registerDonor = async (req, res) => {
  try {
    // Extract donor details from the request body
    const {
      fullName, nic, age, district, weight,
      contactNumber, email, password, bloodType,
    } = req.body;

    // Validate required fields
    if (!fullName || !nic || !age || !district || !weight || 
        !contactNumber || !email || !password || !bloodType) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if a user already exists with the same email or NIC
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { nic }],
    });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or NIC already exists.',
      });
    }

    // Hash the password with bcrypt using 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new donor user in the database
    const newUser = await User.create({
      fullName, nic, age, district, weight,
      contactNumber, email: email.toLowerCase(),
      password: hashedPassword, bloodType,
    });

    // Send back a success response with basic user info
    res.status(201).json({
      message: 'Donor registered successfully.',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Registration failed.',
      error: error.message,
    });
  }
};

// ============ HOSPITAL REGISTRATION ============
// Controller function to register a new hospital
exports.registerHospital = async (req, res) => {
  try {
    // Extract hospital details from the request body
    const {
      hospitalName, registrationId, district,
      officialEmail, contactNumber, password,
    } = req.body;

    // Validate required fields
    if (!hospitalName || !registrationId || !district ||
        !officialEmail || !contactNumber || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if a hospital already exists with the same email or reg ID
    const existingHospital = await Hospital.findOne({
      $or: [
        { officialEmail: officialEmail.toLowerCase() },
        { registrationId },
      ],
    });
    if (existingHospital) {
      return res.status(400).json({
        message: 'Hospital with this email or registration ID already exists.',
      });
    }

    // Hash the hospital password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new hospital account in the database
    const newHospital = await Hospital.create({
      hospitalName, registrationId, district,
      officialEmail: officialEmail.toLowerCase(),
      contactNumber,
      password: hashedPassword,
    });

    // Respond with success; hospital awaits admin approval
    res.status(201).json({
      message: 'Hospital account created. Pending admin approval.',
      hospital: {
        id: newHospital._id,
        hospitalName: newHospital.hospitalName,
        status: newHospital.status,
      },
    });
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Hospital registration failed.',
      error: error.message,
    });
  }
};

// ============ COMMON LOGIN ============
// Controller function handling login for both donors and hospitals
exports.login = async (req, res) => {
  try {
    // Extract identifier, password, and role from request body
    const { identifier, password, role } = req.body;

    // Validate all login fields are provided
    if (!identifier || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Normalize role to uppercase
    const normalizedRole = role.toUpperCase();
    let account = null;
    let accountType = '';

    // Look up donor by email
    if (normalizedRole === 'DONOR') {
  account = await User.findOne({ email: identifier.toLowerCase() }).select('+password');
  accountType = 'Donor';
} else if (normalizedRole === 'HOSPITAL') {
  account = await Hospital.findOne({
    $or: [
      { officialEmail: identifier.toLowerCase() },
      { registrationId: identifier },
    ],
  }).select('+password');
  accountType = 'Hospital';
} else if (normalizedRole === 'ADMIN') {
  account = await Admin.findOne({ email: identifier.toLowerCase() }).select('+password');
  accountType = 'Admin';
} else {
  return res.status(400).json({ message: 'Invalid role specified.' });
}

    // Return error if the account is not found
    if (!account) {
      return res.status(404).json({ message: `${accountType} account not found.` });
    }

    // Compare provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check hospital approval status
    if (normalizedRole === 'HOSPITAL' && account.status !== 'APPROVED') {
      return res.status(403).json({
        message: `Hospital account is ${account.status.toLowerCase()}. Please wait for admin approval.`,
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: account._id,
        role: account.role,
        district: account.district,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Send back the token and basic account info
    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: account._id,
        name: account.fullName || account.hospitalName,
        role: account.role,
        district: account.district,
        email: account.email || account.officialEmail,
      },
    });
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Login failed.',
      error: error.message,
    });
  }
};