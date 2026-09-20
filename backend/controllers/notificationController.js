// Import Notification model to interact with notifications
const Notification = require('../models/Notification');

// GET /api/notifications
// Controller to fetch all notifications for the logged-in donor
exports.getDonorNotifications = async (req, res) => {
  try {
    // Fetch notifications and populate request + hospital details
    const notifications = await Notification.find({ recipientDonor: req.user.id })
      .populate({
        path: 'requestId',
        populate: { path: 'hospital', select: 'hospitalName contactNumber district' },
      })
      .sort({ createdAt: -1 });

    // Send the populated notifications back to the client
    res.status(200).json(notifications);
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Failed to fetch notifications.',
      error: error.message,
    });
  }
};

// PUT /api/notifications/:notificationId/read
// Controller to mark a single notification as read
exports.markAsRead = async (req, res) => {
  try {
    // Get the notification ID from URL parameters
    const { notificationId } = req.params;

    // Update only if notification belongs to the logged-in donor
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientDonor: req.user.id },
      { isRead: true },
      { new: true }
    );

    // Return error if no matching notification was found
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    // Confirm the notification was marked as read
    res.status(200).json({ message: 'Marked as read.', notification });
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Failed to update notification.',
      error: error.message,
    });
  }
};

// Controller to mark all donor notifications as read at once
exports.markAllAsRead = async (req, res) => {
  try {
    // Bulk update all unread notifications for this donor
    await Notification.updateMany(
      { recipientDonor: req.user.id, isRead: false },
      { isRead: true }
    );
    // Confirm all notifications were updated
    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error) {
    // Handle any unexpected server or database errors
    res.status(500).json({
      message: 'Failed to mark all as read.',
      error: error.message,
    });
  }
};