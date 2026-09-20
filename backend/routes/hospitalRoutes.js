// Import express to create a router instance
const express = require('express');
// Create a new router to define hospital-related endpoints
const router = express.Router();
// Import the hospital controller functions
const hospitalController = require('../controllers/hospitalController');
// Import auth middleware to protect these routes
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Route: GET /dashboard-stats -> fetch hospital dashboard metrics
router.get(
  '/dashboard-stats',
  verifyToken,
  authorizeRoles('HOSPITAL'),
  hospitalController.getHospitalDashboardStats
);

// Route: GET /donors -> fetch privacy-compliant donor directory
router.get(
  '/donors',
  verifyToken,
  authorizeRoles('HOSPITAL'),
  hospitalController.getRegisteredDonors
);

router.get(
  '/chart-stats',
  verifyToken,
  authorizeRoles('HOSPITAL'),
  hospitalController.getHospitalChartStats
);

router.get(
  '/request-history',
  verifyToken,
  authorizeRoles('HOSPITAL'),
  hospitalController.getHospitalRequestHistory
);

// Export the router so it can be mounted in the main server file
module.exports = router;