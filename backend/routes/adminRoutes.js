const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// All routes require ADMIN role
router.use(verifyToken, authorizeRoles('ADMIN'));

router.get('/dashboard-stats', adminController.getAdminDashboardStats);
router.get('/hospitals', adminController.getHospitals);
router.put('/hospitals/:hospitalId/status', adminController.updateHospitalStatus);
router.delete('/hospitals/:hospitalId', adminController.deleteHospital);

module.exports = router;