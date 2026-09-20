// Import express to create a router instance
const express = require('express');
// Create a new router to define notification endpoints
const router = express.Router();
// Import the notification controller functions
const notificationController = require('../controllers/notificationController');
// Import auth middleware to protect these routes
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Specific routes BEFORE wildcards
// Route: PUT /mark-all-read -> mark all donor notifications as read
router.put('/mark-all-read', verifyToken, authorizeRoles('DONOR'), notificationController.markAllAsRead);

// General routes
// Route: GET / -> list all notifications for the logged-in donor
router.get('/', verifyToken, authorizeRoles('DONOR'), notificationController.getDonorNotifications);
// Route: PUT /:notificationId/read -> mark a single notification as read
router.put('/:notificationId/read', verifyToken, authorizeRoles('DONOR'), notificationController.markAsRead);

// Export the router so it can be mounted in the main server file
module.exports = router;