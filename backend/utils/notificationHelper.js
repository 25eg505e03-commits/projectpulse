const Notification = require('../models/Notification');

const createNotification = async ({ user, message, type, relatedEntity }) => {
  try {
    if (!user) return;
    await Notification.create({
      user,
      message,
      type: type || 'task_assigned',
      relatedEntity,
    });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

module.exports = createNotification;
