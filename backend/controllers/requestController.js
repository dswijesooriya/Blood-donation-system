// Import all models needed for blood request operations
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const DonorResponse = require('../models/DonorResponse');

// ============================================================
// HOSPITAL: Create a new blood request + notify matching donors
// POST /api/requests
// ============================================================
// Controller for hospitals to create a blood request
exports.createBloodRequest = async (req, res) => {
  try {
    // Extract request details from the request body
    const { bloodType, unitsNeeded, district, urgencyStatus, contactNumber } = req.body;

    // Validate required fields
    if (!bloodType || !unitsNeeded || !district || !contactNumber) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create the blood request linked to the logged-in hospital
    const newRequest = await BloodRequest.create({
      hospital: req.user.id,
      bloodType,
      unitsNeeded,
      district,
      urgencyStatus: urgencyStatus || 'low',
      contactNumber,
    });

    // Find matching eligible donors (same district + blood type)
    // Query donors matching district, blood type, and eligibility
    const matchingDonors = await User.find({
      role: 'DONOR',
      district,
      bloodType,
      isEligible: true,
    }).select('_id');

    // Create notifications for matching donors
    if (matchingDonors.length > 0) {
      // Build a notification object for each matching donor
      const notifications = matchingDonors.map((donor) => ({
        recipientDonor: donor._id,
        requestId: newRequest._id,
        message: `Urgent: A blood request for ${bloodType} in ${district} district has been posted.`,
      }));
      // Bulk insert all notifications at once for efficiency
      await Notification.insertMany(notifications);
    }

    // Respond with the new request and number of donors notified
    res.status(201).json({
      message: 'Blood request created and notifications sent.',
      request: newRequest,
      notifiedDonorsCount: matchingDonors.length,
    });
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Error processing blood request.',
      error: error.message,
    });
  }
};

// ============================================================
// PUBLIC: Get all active blood requests
// GET /api/requests/public
// ============================================================
// Controller to fetch all unfulfilled blood requests publicly
exports.getPublicRequests = async (req, res) => {
  try {
    // Extract optional filters from query parameters
    const { district, bloodType } = req.query;
    // Base filter to only show active (unfulfilled) requests
    const queryFilter = { isFulfilled: false };

    // Apply district filter if provided
    if (district) queryFilter.district = district;
    // Apply blood type filter, ignoring the default "All" option
    if (bloodType && bloodType !== 'All') queryFilter.bloodType = bloodType;

    // Fetch requests and populate hospital details
    const requests = await BloodRequest.find(queryFilter)
      .populate('hospital', 'hospitalName district contactNumber')
      .sort({ createdAt: -1 });

    // Send the list of public requests back to the client
    res.status(200).json(requests);
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Failed to fetch blood requests.',
      error: error.message,
    });
  }
};

// ============================================================
// HOSPITAL: Get own requests WITH response counts
// GET /api/requests/my-requests
// ============================================================
// Controller for hospitals to view their own requests
exports.getMyRequests = async (req, res) => {
  try {
    // Fetch all requests belonging to the logged-in hospital
    const requests = await BloodRequest.find({ hospital: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Attach response count to each request
    // Loop through requests and count donor responses
    const requestsWithCounts = await Promise.all(
      requests.map(async (reqItem) => {
        // Count how many donors responded to this request
        const count = await DonorResponse.countDocuments({ request: reqItem._id });
        // Return the request with the response count added
        return { ...reqItem, responseCount: count };
      })
    );

    // Send enriched requests back to the client
    res.status(200).json(requestsWithCounts);
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Failed to fetch your requests.',
      error: error.message,
    });
  }
};

// ============================================================
// HOSPITAL: Update a blood request
// PUT /api/requests/:requestId
// ============================================================
// Controller to update one of the hospital's own requests
exports.updateBloodRequest = async (req, res) => {
  try {
    // Get the request ID from URL parameters
    const { requestId } = req.params;
    // Get the fields to update from the request body
    const updates = req.body;

    // Update only if the request belongs to the logged-in hospital
    const updated = await BloodRequest.findOneAndUpdate(
      { _id: requestId, hospital: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Return error if no matching request was found
    if (!updated) {
      return res.status(404).json({ message: 'Request not found or unauthorized.' });
    }

    // Send back the updated request
    res.status(200).json({ message: 'Request updated.', request: updated });
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Failed to update request.',
      error: error.message,
    });
  }
};

// ============================================================
// HOSPITAL: Delete a blood request + cleanup
// DELETE /api/requests/:requestId
// ============================================================
// Controller to delete a request along with related records
exports.deleteBloodRequest = async (req, res) => {
  try {
    // Get the request ID from URL parameters
    const { requestId } = req.params;

    // Delete only if the request belongs to the logged-in hospital
    const deleted = await BloodRequest.findOneAndDelete({
      _id: requestId,
      hospital: req.user.id,
    });

    // Return error if no matching request was found
    if (!deleted) {
      return res.status(404).json({ message: 'Request not found or unauthorized.' });
    }

    // Cleanup: remove related notifications and donor responses
    // Delete all notifications tied to this request
    await Notification.deleteMany({ requestId });
    // Delete all donor responses tied to this request
    await DonorResponse.deleteMany({ request: requestId });

    // Confirm successful deletion
    res.status(200).json({ message: 'Blood request removed successfully.' });
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Failed to delete request.',
      error: error.message,
    });
  }
};

// ============================================================
// DONOR: Respond "I can donate" to a request
// POST /api/requests/:requestId/respond
// ============================================================
// Controller for donors to respond to a blood request
exports.respondToRequest = async (req, res) => {
  try {
    // Get request ID from params and donor ID from JWT
    const { requestId } = req.params;
    const donorId = req.user.id;

    // Check the request exists
    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Prevent responses to already fulfilled requests
    if (request.isFulfilled) {
      return res.status(400).json({ message: 'This request is already fulfilled.' });
    }

    // Check if already responded
    // Prevent duplicate responses from the same donor
    const existing = await DonorResponse.findOne({
      donor: donorId,
      request: requestId,
    });
    if (existing) {
      return res.status(400).json({
        message: 'You already responded to this request.',
      });
    }

    // Create a new donor response document
    const response = await DonorResponse.create({
      donor: donorId,
      request: requestId,
    });

    // Confirm the response was recorded
    res.status(201).json({
      message: 'Response recorded. The hospital will contact you soon.',
      response,
    });
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Failed to respond.',
      error: error.message,
    });
  }
};

// ============================================================
// DONOR: Get all responses made by the logged-in donor
// GET /api/requests/my-responses
// ============================================================
// Controller for donors to view their own responses
exports.getMyResponses = async (req, res) => {
  try {
    // Fetch responses and populate request + hospital details
    const responses = await DonorResponse.find({ donor: req.user.id })
      .populate({
        path: 'request',
        populate: { path: 'hospital', select: 'hospitalName district contactNumber' },
      })
      .sort({ createdAt: -1 });

    // Send the populated responses back to the client
    res.status(200).json(responses);
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Failed to load responses.',
      error: error.message,
    });
  }
};

// ============================================================
// HOSPITAL: View all donor responses for a specific request
// GET /api/requests/:requestId/responses
// ============================================================
// Controller for hospitals to view responses for one request
exports.getRequestResponses = async (req, res) => {
  try {
    // Get request ID from URL parameters
    const { requestId } = req.params;

    // Verify request belongs to this hospital
    const request = await BloodRequest.findOne({
      _id: requestId,
      hospital: req.user.id,
    });
    if (!request) {
      return res.status(404).json({ message: 'Request not found or unauthorized.' });
    }

    // Fetch all responses with limited donor details
    const responses = await DonorResponse.find({ request: requestId })
      .populate('donor', 'fullName bloodType district contactNumber email')
      .sort({ createdAt: -1 });

    // Return the request, count, and list of responses
    res.status(200).json({
      request,
      responseCount: responses.length,
      responses,
    });
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Failed to load responses.',
      error: error.message,
    });
  }
};

// ============================================================
// HOSPITAL: Update the status of a donor response
// PUT /api/requests/responses/:responseId/status
// ============================================================
// Controller to change the status of a donor's response
exports.updateResponseStatus = async (req, res) => {
  try {
    // Get response ID from params and new status from body
    const { responseId } = req.params;
    const { status } = req.body;

    // Ensure the status value is one of the allowed options
    if (!['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    // Find the response and populate its parent request
    const response = await DonorResponse.findById(responseId).populate('request');
    if (!response) {
      return res.status(404).json({ message: 'Response not found.' });
    }

    // Verify the request belongs to this hospital
    if (response.request.hospital.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    // Update and save the response status
    response.status = status;
    await response.save();

    // Confirm the status update
    res.status(200).json({ message: 'Status updated.', response });
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Failed to update.',
      error: error.message,
    });
  }
};


// ============================================================
// HOSPITAL: Mark a response as COMPLETED and record the donation
// PUT /api/requests/responses/:responseId/mark-donated
// ============================================================
exports.markDonationCompleted = async (req, res) => {
  try {
    const { responseId } = req.params;
    const User = require('../models/User');

    // Find the response and verify it belongs to this hospital
    const response = await DonorResponse.findById(responseId).populate('request');
    if (!response) {
      return res.status(404).json({ message: 'Response not found.' });
    }

    if (response.request.hospital.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    if (response.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Donation already recorded.' });
    }

    // Get the hospital's name for the donation record
    const Hospital = require('../models/Hospital');
    const hospital = await Hospital.findById(req.user.id);

    const donationDate = new Date();

    // 1. Update response status to COMPLETED
    // 1. Update response status to COMPLETED
response.status = 'COMPLETED';
await response.save();

// 1b. Mark the request as fulfilled (it disappears from active lists)
const BloodRequest = require('../models/BloodRequest');
const requestDoc = await BloodRequest.findById(response.request._id);
if (requestDoc) {
  requestDoc.isFulfilled = true;
  await requestDoc.save();
}
    // 2. Update the donor
    const donor = await User.findById(response.donor);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found.' });
    }

    donor.lastDonationDate = donationDate;
    donor.isEligible = false; // Ineligible for 90 days

    // Add to donation history
    donor.donationHistory = donor.donationHistory || [];
    donor.donationHistory.push({
      date: donationDate,
      hospitalName: hospital?.hospitalName || 'Hospital',
      unitsDonated: 1, // Could be configurable later
      responseId: response._id,
    });

    await donor.save();

    res.status(200).json({
      message: '✅ Donation recorded! Donor is ineligible for 90 days.',
      response,
      donor: {
        id: donor._id,
        lastDonationDate: donor.lastDonationDate,
        isEligible: donor.isEligible,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to record donation.',
      error: error.message,
    });
  }
};

// ============================================================
// DONOR: Get donation history
// GET /api/requests/my-donations
// ============================================================
exports.getMyDonations = async (req, res) => {
  try {
    const User = require('../models/User');
    const donor = await User.findById(req.user.id).select(
      'donationHistory lastDonationDate isEligible bloodType'
    );

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found.' });
    }

    // Sort history by date descending (newest first)
    const history = (donor.donationHistory || []).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Compute days until eligible
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
      history,
      totalDonations: history.length,
      lastDonationDate: donor.lastDonationDate,
      isEligible: donor.isEligible,
      nextEligibleDate,
      daysUntilEligible,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load donation history.',
      error: error.message,
    });
  }
};