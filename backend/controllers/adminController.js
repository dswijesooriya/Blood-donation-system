const Hospital = require('../models/Hospital');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const DonorResponse = require('../models/DonorResponse');

// GET /api/admin/dashboard-stats
exports.getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalHospitals,
      pendingHospitals,
      approvedHospitals,
      rejectedHospitals,
      totalDonors,
      totalRequests,
    ] = await Promise.all([
      Hospital.countDocuments(),
      Hospital.countDocuments({ status: 'PENDING' }),
      Hospital.countDocuments({ status: 'APPROVED' }),
      Hospital.countDocuments({ status: 'REJECTED' }),
      User.countDocuments({ role: 'DONOR' }),
      BloodRequest.countDocuments(),
    ]);

    res.status(200).json({
      stats: {
        totalHospitals,
        pendingHospitals,
        approvedHospitals,
        rejectedHospitals,
        totalDonors,
        totalRequests,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch stats.',
      error: error.message,
    });
  }
};

// GET /api/admin/hospitals?status=PENDING&search=xxx
exports.getHospitals = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { hospitalName: { $regex: search, $options: 'i' } },
        { registrationId: { $regex: search, $options: 'i' } },
        { officialEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const hospitals = await Hospital.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json(hospitals);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch hospitals.',
      error: error.message,
    });
  }
};

// PUT /api/admin/hospitals/:hospitalId/status
exports.updateHospitalStatus = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found.' });
    }

    res.status(200).json({
      message: `Hospital ${status.toLowerCase()} successfully.`,
      hospital,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update status.',
      error: error.message,
    });
  }
};

// DELETE /api/admin/hospitals/:hospitalId
exports.deleteHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const requests = await BloodRequest.find({ hospital: hospitalId });
    const requestIds = requests.map((r) => r._id);

    await DonorResponse.deleteMany({ request: { $in: requestIds } });
    await BloodRequest.deleteMany({ hospital: hospitalId });

    const hospital = await Hospital.findByIdAndDelete(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found.' });
    }

    res.status(200).json({ message: 'Hospital deleted successfully.' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete hospital.',
      error: error.message,
    });
  }
};