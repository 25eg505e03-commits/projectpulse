const Milestone = require('../models/Milestone');
const logActivity = require('../utils/activityLogger');

// @desc    Create milestone
// @route   POST /api/milestones
// @access  Private
const createMilestone = async (req, res, next) => {
  try {
    const { project, name, description, startDate, dueDate, status, progress } = req.body;

    if (!project || !name || !dueDate) {
      res.status(400);
      return next(new Error('Project, milestone name, and due date are required'));
    }

    const milestone = await Milestone.create({
      project,
      name,
      description: description || '',
      startDate: startDate || Date.now(),
      dueDate,
      status: status || 'not-started',
      progress: progress || 0,
      createdBy: req.user._id,
    });

    await logActivity({
      project,
      user: req.user._id,
      action: 'MILESTONE_CREATED',
      entityType: 'Milestone',
      entityId: milestone._id,
      description: `${req.user.name} created milestone "${milestone.name}"`,
    });

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      data: milestone,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get milestones by project
// @route   GET /api/milestones
// @access  Private
const getMilestones = async (req, res, next) => {
  try {
    const { project } = req.query;
    const filter = {};
    if (project) filter.project = project;

    const milestones = await Milestone.find(filter)
      .populate('createdBy', 'name email avatar')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: milestones,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single milestone by ID
// @route   GET /api/milestones/:id
// @access  Private
const getMilestoneById = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id).populate('createdBy', 'name email avatar');
    if (!milestone) {
      res.status(404);
      return next(new Error('Milestone not found'));
    }
    res.json({
      success: true,
      data: milestone,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private
const updateMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      res.status(404);
      return next(new Error('Milestone not found'));
    }

    milestone.name = req.body.name || milestone.name;
    milestone.description = req.body.description !== undefined ? req.body.description : milestone.description;
    milestone.startDate = req.body.startDate || milestone.startDate;
    milestone.dueDate = req.body.dueDate || milestone.dueDate;
    milestone.status = req.body.status || milestone.status;
    if (req.body.progress !== undefined) milestone.progress = req.body.progress;

    const updatedMilestone = await milestone.save();

    await logActivity({
      project: milestone.project,
      user: req.user._id,
      action: 'MILESTONE_UPDATED',
      entityType: 'Milestone',
      entityId: milestone._id,
      description: `${req.user.name} updated milestone "${milestone.name}"`,
    });

    res.json({
      success: true,
      message: 'Milestone updated successfully',
      data: updatedMilestone,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private
const deleteMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      res.status(404);
      return next(new Error('Milestone not found'));
    }

    await milestone.deleteOne();

    res.json({
      success: true,
      message: 'Milestone deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMilestone,
  getMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
};
