// Import express to create a router instance
const express = require('express');
// Create a new router to define blood request endpoints
const router = express.Router();
// Import the request controller functions
const requestController = require('../controllers/requestController');
// Import auth middleware to protect private routes
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public
// Route: GET /public -> list all active blood requests (no auth needed)
router.get('/public', requestController.getPublicRequests);

// Donor routes (MUST come before /:requestId routes to avoid conflicts)
// Route: GET /my-responses -> list responses made by the logged-in donor
router.get('/my-responses', verifyToken, authorizeRoles('DONOR'), requestController.getMyResponses);
// Route: POST /:requestId/respond -> donor responds to a specific request
router.post('/:requestId/respond', verifyToken, authorizeRoles('DONOR'), requestController.respondToRequest);

// Hospital routes
// Route: GET /my-requests -> list requests created by the logged-in hospital
router.get('/my-requests', verifyToken, authorizeRoles('HOSPITAL'), requestController.getMyRequests);
// Route: POST / -> create a new blood request
router.post('/', verifyToken, authorizeRoles('HOSPITAL'), requestController.createBloodRequest);
// Route: PUT /:requestId -> update a specific request
router.put('/:requestId', verifyToken, authorizeRoles('HOSPITAL'), requestController.updateBloodRequest);
// Route: DELETE /:requestId -> delete a specific request and related records
router.delete('/:requestId', verifyToken, authorizeRoles('HOSPITAL'), requestController.deleteBloodRequest);
// Route: GET /:requestId/responses -> list all responses for a specific request
router.get('/:requestId/responses', verifyToken, authorizeRoles('HOSPITAL'), requestController.getRequestResponses);

// Response status update (Hospital)
// Route: PUT /responses/:responseId/status -> update a donor response's status
// Response status update (Hospital)
router.put('/responses/:responseId/status', verifyToken, authorizeRoles('HOSPITAL'), requestController.updateResponseStatus);

// Mark donation as completed + record history
router.put('/responses/:responseId/mark-donated', verifyToken, authorizeRoles('HOSPITAL'), requestController.markDonationCompleted);

// Donor donation history
router.get('/my-donations', verifyToken, authorizeRoles('DONOR'), requestController.getMyDonations);

// Export the router so it can be mounted in the main server file
module.exports = router;