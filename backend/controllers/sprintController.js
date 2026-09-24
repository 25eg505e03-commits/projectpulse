const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notificationHelper');

// @desc    Create sprint
// @route   POST /api/sprints
// @access  Private
const createSprint = async (req, res, next) => {
  try {
    const { project, name, goal, startDate, endDate } = req.body;

    if (!project || !name) {
      res.status(400);
      return next(new Error('Project ID and sprint name are required'));
    }

    const sprint = await Sprint.create({
      project,
      name,
      goal: goal || '',
      startDate,
      endDate,
      status: 'planned',
    });

    await logActivity({
      project,
      user: req.user._id,
      action: 'SPRINT_CREATED',
      entityType: 'Sprint',
      entityId: sprint._id,
      description: `${req.user.name} created sprint "${sprint.name}"`,
    });

    res.status(201).json({
      success: true,
      message: 'Sprint created successfully',
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sprints by project
// @route   GET /api/sprints
// @access  Private
const getSprints = async (req, res, next) => {
  try {
    const { project, status } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (status) filter.status = status;

    const sprints = await Sprint.find(filter)
      .populate({
        path: 'tasks',
        populate: [
          { path: 'assignee', select: 'name email avatar' },
          { path: 'labels', select: 'name color' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: sprints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sprint by ID
// @route   GET /api/sprints/:id
// @access  Private
const getSprintById = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id)
      .populate({
        path: 'tasks',
        populate: [
          { path: 'assignee', select: 'name email avatar' },
          { path: 'labels', select: 'name color' }
        ]
      });

    if (!sprint) {
      res.status(404);
      return next(new Error('Sprint not found'));
    }

    res.json({
      success: true,
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sprint
// @route   PUT /api/sprints/:id
// @access  Private
const updateSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      res.status(404);
      return next(new Error('Sprint not found'));
    }

    sprint.name = req.body.name || sprint.name;
    sprint.goal = req.body.goal !== undefined ? req.body.goal : sprint.goal;
    sprint.startDate = req.body.startDate || sprint.startDate;
    sprint.endDate = req.body.endDate || sprint.endDate;
    if (req.body.status) sprint.status = req.body.status;

    const updatedSprint = await sprint.save();

    res.json({
      success: true,
      message: 'Sprint updated successfully',
      data: updatedSprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start sprint
// @route   PATCH /api/sprints/:id/start
// @access  Private
const startSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      res.status(404);
      return next(new Error('Sprint not found'));
    }

    sprint.status = 'active';
    if (!sprint.startDate) sprint.startDate = new Date();
    await sprint.save();

    await logActivity({
      project: sprint.project,
      user: req.user._id,
      action: 'SPRINT_STARTED',
      entityType: 'Sprint',
      entityId: sprint._id,
      description: `${req.user.name} started sprint "${sprint.name}"`,
    });

    res.json({
      success: true,
      message: `Sprint "${sprint.name}" is now active!`,
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete sprint
// @route   PATCH /api/sprints/:id/complete
// @access  Private
const completeSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      res.status(404);
      return next(new Error('Sprint not found'));
    }

    sprint.status = 'completed';
    if (!sprint.endDate) sprint.endDate = new Date();
    await sprint.save();

    // Move incomplete tasks back to backlog (sprint: null)
    await Task.updateMany(
      { sprint: sprint._id, status: { $ne: 'done' } },
      { sprint: null }
    );

    await logActivity({
      project: sprint.project,
      user: req.user._id,
      action: 'SPRINT_COMPLETED',
      entityType: 'Sprint',
      entityId: sprint._id,
      description: `${req.user.name} completed sprint "${sprint.name}"`,
    });

    res.json({
      success: true,
      message: `Sprint "${sprint.name}" has been completed! Incomplete tasks returned to backlog.`,
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sprint
// @route   DELETE /api/sprints/:id
// @access  Private
const deleteSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      res.status(404);
      return next(new Error('Sprint not found'));
    }

    // Unassign tasks attached to this sprint
    await Task.updateMany({ sprint: sprint._id }, { sprint: null });

    await sprint.deleteOne();

    res.json({
      success: true,
      message: 'Sprint deleted successfully. Associated tasks moved to backlog.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSprint,
  getSprints,
  getSprintById,
  updateSprint,
  startSprint,
  completeSprint,
  deleteSprint,
};
