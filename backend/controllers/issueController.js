const Issue = require('../models/Issue');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notificationHelper');

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res, next) => {
  try {
    const {
      project,
      title,
      description,
      severity,
      priority,
      status,
      assignee,
      reproductionSteps,
      expectedResult,
      actualResult,
      attachments,
    } = req.body;

    if (!project || !title) {
      res.status(400);
      return next(new Error('Project ID and issue title are required'));
    }

    const issue = await Issue.create({
      project,
      title,
      description: description || '',
      severity: severity || 'medium',
      priority: priority || 'medium',
      status: status || 'open',
      reporter: req.user._id,
      assignee: assignee || null,
      reproductionSteps: reproductionSteps || '',
      expectedResult: expectedResult || '',
      actualResult: actualResult || '',
      attachments: attachments || [],
      statusHistory: [
        {
          status: status || 'open',
          changedBy: req.user._id,
          changedAt: new Date(),
        },
      ],
    });

    if (assignee) {
      await createNotification({
        user: assignee,
        message: `${req.user.name} assigned issue "${issue.title}" to you`,
        type: 'issue_assigned',
        relatedEntity: { entityType: 'Issue', entityId: issue._id },
      });
    }

    await logActivity({
      project,
      user: req.user._id,
      action: 'ISSUE_CREATED',
      entityType: 'Issue',
      entityId: issue._id,
      description: `${req.user.name} reported issue "${issue.title}" [${issue.severity.toUpperCase()}]`,
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate('reporter', 'name email avatar')
      .populate('assignee', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: populatedIssue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get issues with filtering & pagination
// @route   GET /api/issues
// @access  Private
const getIssues = async (req, res, next) => {
  try {
    const { project, status, severity, priority, assignee, search, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (project) filter.project = project;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .populate('reporter', 'name email avatar')
      .populate('assignee', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: issues,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get issue by ID
// @route   GET /api/issues/:id
// @access  Private
const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reporter', 'name email avatar phone')
      .populate('assignee', 'name email avatar phone')
      .populate('statusHistory.changedBy', 'name email')
      .populate('attachments');

    if (!issue) {
      res.status(404);
      return next(new Error('Issue not found'));
    }

    res.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private
const updateIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      res.status(404);
      return next(new Error('Issue not found'));
    }

    const oldStatus = issue.status;
    const oldAssignee = issue.assignee ? issue.assignee.toString() : null;

    issue.title = req.body.title || issue.title;
    issue.description = req.body.description !== undefined ? req.body.description : issue.description;
    issue.severity = req.body.severity || issue.severity;
    issue.priority = req.body.priority || issue.priority;
    issue.assignee = req.body.assignee !== undefined ? req.body.assignee : issue.assignee;
    issue.reproductionSteps = req.body.reproductionSteps !== undefined ? req.body.reproductionSteps : issue.reproductionSteps;
    issue.expectedResult = req.body.expectedResult !== undefined ? req.body.expectedResult : issue.expectedResult;
    issue.actualResult = req.body.actualResult !== undefined ? req.body.actualResult : issue.actualResult;
    issue.resolution = req.body.resolution !== undefined ? req.body.resolution : issue.resolution;

    if (req.body.status && req.body.status !== oldStatus) {
      issue.status = req.body.status;
      issue.statusHistory.push({
        status: req.body.status,
        changedBy: req.user._id,
        changedAt: new Date(),
      });
    }

    const updatedIssue = await issue.save();

    if (updatedIssue.assignee && updatedIssue.assignee.toString() !== oldAssignee) {
      await createNotification({
        user: updatedIssue.assignee,
        message: `${req.user.name} assigned issue "${updatedIssue.title}" to you`,
        type: 'issue_assigned',
        relatedEntity: { entityType: 'Issue', entityId: updatedIssue._id },
      });
    }

    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: updatedIssue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Patch Issue Status
// @route   PATCH /api/issues/:id/status
// @access  Private
const updateIssueStatus = async (req, res, next) => {
  try {
    const { status, resolution } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404);
      return next(new Error('Issue not found'));
    }

    const oldStatus = issue.status;
    issue.status = status;
    if (resolution) issue.resolution = resolution;

    issue.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedAt: new Date(),
    });

    await issue.save();

    await logActivity({
      project: issue.project,
      user: req.user._id,
      action: status === 'resolved' ? 'ISSUE_RESOLVED' : 'ISSUE_STATUS_CHANGED',
      entityType: 'Issue',
      entityId: issue._id,
      description: `${req.user.name} changed status of issue "${issue.title}" from ${oldStatus} to ${status}`,
    });

    res.json({
      success: true,
      message: `Issue status changed to ${status}`,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private
const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      res.status(404);
      return next(new Error('Issue not found'));
    }

    await issue.deleteOne();

    res.json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  updateIssueStatus,
  deleteIssue,
};
