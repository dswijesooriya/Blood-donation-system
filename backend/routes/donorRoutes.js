// Import express to create a router instance
const express = require('express');
// Create a new router to define donor-related endpoints
const router = express.Router();
// Import the donor controller functions
const donorController = require('../controllers/donorController');
// Import auth middleware to protect these routes
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Route: GET /profile -> fetch the logged-in donor's profile
router.get('/profile', verifyToken, authorizeRoles('DONOR'), donorController.getDonorProfile);
// Route: PUT /profile -> update the logged-in donor's profile
router.put('/profile', verifyToken, authorizeRoles('DONOR'), donorController.updateDonorProfile);

router.get(
  '/chart-stats',
  verifyToken,
  authorizeRoles('DONOR'),
  donorController.getDonorChartStats
);

// Export the router so it can be mounted in the main server file
module.exports = router;