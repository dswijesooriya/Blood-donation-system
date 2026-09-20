// Import User model to interact with donor data
const User = require('../models/User');


// GET /api/donors/profile
// Controller to fetch the logged-in donor's profile
exports.getDonorProfile = async (req, res) => {
  try {
    const donor = await User.findById(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found.' });
    }

    // Auto re-check eligibility: if 90 days have passed since last donation,
    // flip isEligible back to true.
    if (donor.lastDonationDate && !donor.isEligible) {
      const ninetyDaysLater = new Date(donor.lastDonationDate);
      ninetyDaysLater.setDate(ninetyDaysLater.getDate() + 90);

      if (new Date() >= ninetyDaysLater) {
        donor.isEligible = true;
        await donor.save();
      }
    }

    // Compute days until eligible for the frontend
    let daysUntilEligible = 0;
    let nextEligibleDate = null;
    if (donor.lastDonationDate && !donor.isEligible) {
      const ninetyDaysLater = new Date(donor.lastDonationDate);
      ninetyDaysLater.setDate(ninetyDaysLater.getDate() + 90);
      nextEligibleDate = ninetyDaysLater;
      const diff = ninetyDaysLater - new Date();
      daysUntilEligible = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    res.status(200).json({
      ...donor.toObject(),
      daysUntilEligible,
      nextEligibleDate,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch profile.',
      error: error.message,
    });
  }
};

// PUT /api/donors/profile
// Controller to update the logged-in donor's profile
exports.updateDonorProfile = async (req, res) => {
  try {
    // Extract the fields allowed to be updated from request body
    const { fullName, contactNumber, district, weight, isEligible } = req.body;

    // Find the donor by id and update only the provided fields
    const updatedDonor = await User.findByIdAndUpdate(
      req.user.id,
      {
        // Use spread syntax to conditionally set only provided fields
        $set: {
          ...(fullName && { fullName }),
          ...(contactNumber && { contactNumber }),
          ...(district && { district }),
          ...(weight && { weight }),
          ...(isEligible !== undefined && { isEligible }),
        },
      },
      // Return the new document and run schema validators
      { new: true, runValidators: true }
    );

    // If no donor was found, send a not found error
    if (!updatedDonor) {
      return res.status(404).json({ message: 'Donor not found.' });
    }

    // Respond with the updated donor information
    res.status(200).json({
      message: 'Profile updated successfully.',
      user: updatedDonor,
    });
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Failed to update profile.',
      error: error.message,
    });
  }
};

// GET /api/donors/chart-stats
exports.getDonorChartStats = async (req, res) => {
  try {
    const User = require('../models/User');
    const BloodRequest = require('../models/BloodRequest');
    const DonorResponse = require('../models/DonorResponse');
    const mongoose = require('mongoose');
const donorObjectId = new mongoose.Types.ObjectId(req.user.id);

    const donorId = req.user.id;

    // Get donor's district
    const donor = await User.findById(donorId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found.' });
    }

    // Blood group distribution in donor's district
    const districtBloodTypes = await User.aggregate([
      {
        $match: {
          role: 'DONOR',
          district: donor.district,
        },
      },
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const bloodMap = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
      'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0,
    };
    districtBloodTypes.forEach((b) => {
      if (bloodMap[b._id] !== undefined) bloodMap[b._id] = b.count;
    });

    // Donor's responses over last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyResponses = await DonorResponse.aggregate([
      {
        $match: {
  donor: donorObjectId,
  createdAt: { $gte: sixMonthsAgo },
},
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build last 6 months array
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const found = monthlyResponses.find((m) => m._id === key);
      months.push({
        month: monthNames[d.getMonth()],
        count: found ? found.count : 0,
      });
    }

    res.status(200).json({
      bloodTypeDistribution: bloodMap,
      responsesByMonth: months,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch chart stats.',
      error: error.message,
    });
  }
};