const Activity = require('../models/Activity');

const logActivity = async ({ organization, project, user, action, entityType, entityId, description }) => {
  try {
    await Activity.create({
      organization,
      project,
      user,
      action,
      entityType,
      entityId,
      description,
    });
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};

module.exports = logActivity;
