const Task = require('../models/Task');
const Issue = require('../models/Issue');
const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const Milestone = require('../models/Milestone');

// @desc    Get project summary reporting analytics
// @route   GET /api/reports/project/:projectId
// @access  Private
const getProjectReport = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    const tasks = await Task.find({ project: projectId });
    const issues = await Issue.find({ project: projectId });
    const sprints = await Sprint.find({ project: projectId });
    const milestones = await Milestone.find({ project: projectId });

    // Task status breakdown
    const taskStatusDistribution = [
      { name: 'TODO', count: tasks.filter(t => t.status === 'todo').length },
      { name: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length },
      { name: 'Review', count: tasks.filter(t => t.status === 'review').length },
      { name: 'Done', count: tasks.filter(t => t.status === 'done').length },
    ];

    // Priority breakdown
    const taskPriorityDistribution = [
      { name: 'Low', count: tasks.filter(t => t.priority === 'low').length },
      { name: 'Medium', count: tasks.filter(t => t.priority === 'medium').length },
      { name: 'High', count: tasks.filter(t => t.priority === 'high').length },
      { name: 'Critical', count: tasks.filter(t => t.priority === 'critical').length },
    ];

    // Issue severity breakdown
    const issueSeverityDistribution = [
      { name: 'Low', count: issues.filter(i => i.severity === 'low').length },
      { name: 'Medium', count: issues.filter(i => i.severity === 'medium').length },
      { name: 'High', count: issues.filter(i => i.severity === 'high').length },
      { name: 'Critical', count: issues.filter(i => i.severity === 'critical').length },
    ];

    // Story Points
    const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedStoryPoints = tasks
      .filter(t => t.status === 'done')
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    res.json({
      success: true,
      data: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'done').length,
        pendingTasks: tasks.filter(t => t.status !== 'done').length,
        totalIssues: issues.length,
        resolvedIssues: issues.filter(i => i.status === 'resolved' || i.status === 'closed').length,
        totalSprints: sprints.length,
        activeSprint: sprints.find(s => s.status === 'active') || null,
        totalMilestones: milestones.length,
        completedMilestones: milestones.filter(m => m.status === 'completed').length,
        totalStoryPoints,
        completedStoryPoints,
        taskStatusDistribution,
        taskPriorityDistribution,
        issueSeverityDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get workload distribution by team member
// @route   GET /api/reports/workload/:projectId
// @access  Private
const getWorkloadReport = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate('members.user', 'name email avatar');
    if (!project) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    const tasks = await Task.find({ project: projectId }).populate('assignee', 'name email avatar');
    const activeSprint = await Sprint.findOne({ project: projectId, status: 'active' });

    const memberMap = {};

    project.members.forEach((m) => {
      if (m.user) {
        memberMap[m.user._id.toString()] = {
          userId: m.user._id,
          name: m.user.name,
          email: m.user.email,
          avatar: m.user.avatar,
          role: m.projectRole,
          totalAssigned: 0,
          completed: 0,
          inProgress: 0,
          storyPoints: 0,
          activeSprintWorkload: 0,
        };
      }
    });

    tasks.forEach((t) => {
      if (t.assignee && memberMap[t.assignee._id.toString()]) {
        const item = memberMap[t.assignee._id.toString()];
        item.totalAssigned += 1;
        item.storyPoints += t.storyPoints || 0;

        if (t.status === 'done') {
          item.completed += 1;
        } else if (t.status === 'in-progress' || t.status === 'review') {
          item.inProgress += 1;
        }

        if (activeSprint && t.sprint && t.sprint.toString() === activeSprint._id.toString()) {
          item.activeSprintWorkload += 1;
        }
      }
    });

    res.json({
      success: true,
      data: Object.values(memberMap),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectReport,
  getWorkloadReport,
};
