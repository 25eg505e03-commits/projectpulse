const Activity = require('../models/Activity');

// @desc    Get activity logs
// @route   GET /api/activity
// @access  Private
const getActivities = async (req, res, next) => {
  try {
    const { project, organization, limit = 50, page = 1 } = req.query;

    const filter = {};
    if (project) filter.project = project;
    if (organization) filter.organization = organization;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Activity.countDocuments(filter);
    const activities = await Activity.find(filter)
      .populate('user', 'name email avatar')
      .populate('project', 'name projectKey')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: activities,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
};
