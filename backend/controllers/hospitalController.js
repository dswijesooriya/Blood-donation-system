// Import models needed for hospital dashboard and donor directory
const mongoose = require('mongoose');
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const DonorResponse = require('../models/DonorResponse');

// ============================================================
// HOSPITAL: Get dashboard stats + recent requests with response counts
// GET /api/hospitals/dashboard-stats
// ============================================================
// Controller to fetch dashboard statistics for a logged-in hospital
exports.getHospitalDashboardStats = async (req, res) => {
  try {
    // Get the hospital id from the verified JWT
    const hospitalId = req.user.id;

    // Run all count and fetch queries in parallel for speed
    const [totalRequests, activeRequests, criticalRequests, completedRequests, recentRequestsRaw] =
  await Promise.all([
    BloodRequest.countDocuments({ hospital: hospitalId }),
    BloodRequest.countDocuments({ hospital: hospitalId, isFulfilled: false }),
    BloodRequest.countDocuments({
      hospital: hospitalId,
      isFulfilled: false,
      urgencyStatus: 'critical',
    }),
    BloodRequest.countDocuments({ hospital: hospitalId, isFulfilled: true }),
    BloodRequest.find({ hospital: hospitalId, isFulfilled: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

    // Attach response count to each recent request
    // Loop through recent requests to add donor response counts
    const recentRequests = await Promise.all(
      recentRequestsRaw.map(async (reqItem) => {
        // Count how many donors responded to this request
        const count = await DonorResponse.countDocuments({ request: reqItem._id });
        // Return the request with the response count added
        return { ...reqItem, responseCount: count };
      })
    );

    // Send back stats and enriched recent requests
    res.status(200).json({
  stats: { totalRequests, activeRequests, criticalRequests, completedRequests },
  recentRequests,
});
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Failed to fetch dashboard metrics.',
      error: error.message,
    });
  }
};

// ============================================================
// HOSPITAL: Get registered donors (privacy-compliant)
// GET /api/hospitals/donors
// ============================================================
// Controller to fetch a filtered list of registered donors
exports.getRegisteredDonors = async (req, res) => {
  try {
    // Extract optional filters from query parameters
    const { district, bloodType, search } = req.query;
    // Base filter to only return users with the DONOR role
    const filter = { role: 'DONOR' };

    // Apply district filter if provided
    if (district) filter.district = district;
    // Apply blood type filter, ignoring the default "All" option
    if (bloodType && bloodType !== 'All Blood Groups') {
      filter.bloodType = bloodType;
    }

    // Note: search by contactNumber only (fullName is restricted per SRS)
    // Use case-insensitive regex to search contact numbers
    if (search) {
      filter.contactNumber = { $regex: search, $options: 'i' };
    }

    // Only return permitted fields per SRS privacy requirements
    // Select only allowed fields and sort newest donors first
    const donors = await User.find(filter)
      .select('_id bloodType district contactNumber createdAt isEligible')
      .sort({ createdAt: -1 });

    // Send the filtered donors list back to the client
    res.status(200).json(donors);
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Error retrieving donor directory.',
      error: error.message,
    });
  }
};

// GET /api/hospitals/chart-stats
exports.getHospitalChartStats = async (req, res) => {
  try {
    const hospitalId = req.user.id;

    // Get all requests for this hospital
    const requests = await BloodRequest.find({ hospital: hospitalId });

    // Responses by status
    const hospitalObjectId = new mongoose.Types.ObjectId(req.user.id);

const responseStatuses = await DonorResponse.aggregate([
  {
    $lookup: {
      from: 'bloodrequests',
      localField: 'request',
      foreignField: '_id',
      as: 'requestData',
    },
  },
  { $unwind: '$requestData' },
  { $match: { 'requestData.hospital': hospitalObjectId } },
  { $group: { _id: '$status', count: { $sum: 1 } } },
]);

    const statusMap = {
      PENDING: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      COMPLETED: 0,
    };
    responseStatuses.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    // Requests over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRequests = await BloodRequest.aggregate([
  {
    $match: {
      hospital: hospitalObjectId,
      createdAt: { $gte: sevenDaysAgo },
    },
  },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build a full 7-day array (fill gaps with 0)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const found = dailyRequests.find((r) => r._id === key);
      last7Days.push({ day: label, count: found ? found.count : 0 });
    }

    res.status(200).json({
      responsesByStatus: statusMap,
      requestsByDay: last7Days,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch chart stats.',
      error: error.message,
    });
  }
};

// ============================================================
// HOSPITAL: Get completed/fulfilled requests with donation details
// GET /api/hospitals/request-history
// ============================================================
exports.getHospitalRequestHistory = async (req, res) => {
  try {
    const DonorResponse = require('../models/DonorResponse');
    const hospitalId = req.user.id;

    // Find all fulfilled requests for this hospital
    const requests = await BloodRequest.find({
      hospital: hospitalId,
      isFulfilled: true,
    })
      .sort({ updatedAt: -1 })
      .lean();

    // For each request, find the completed donor response
    const requestsWithDonations = await Promise.all(
      requests.map(async (reqItem) => {
        // Find the response that was marked COMPLETED
        const completedResponse = await DonorResponse.findOne({
          request: reqItem._id,
          status: 'COMPLETED',
        }).populate('donor', 'fullName bloodType district contactNumber');

        return {
          ...reqItem,
          donation: completedResponse
            ? {
                donorName: completedResponse.donor?.fullName || 'Unknown',
                donorBloodType: completedResponse.donor?.bloodType,
                donorDistrict: completedResponse.donor?.district,
                donorContact: completedResponse.donor?.contactNumber,
                completedAt: completedResponse.updatedAt,
              }
            : null,
        };
      })
    );

    res.status(200).json(requestsWithDonations);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch request history.',
      error: error.message,
    });
  }
};