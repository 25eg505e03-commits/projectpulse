const { getUserProjectRole, hasPermission } = require('../utils/permissions');
const Task = require('../models/Task');
const Issue = require('../models/Issue');
const Sprint = require('../models/Sprint');
const Milestone = require('../models/Milestone');

const checkProjectPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      let projectId = req.params.projectId || req.params.id || req.body.project || req.query.projectId;

      // Infer project if entity ID is passed
      if (!projectId) {
        if (req.params.taskId || req.baseUrl.includes('/tasks')) {
          const task = await Task.findById(req.params.id || req.params.taskId);
          if (task) projectId = task.project;
        } else if (req.params.issueId || req.baseUrl.includes('/issues')) {
          const issue = await Issue.findById(req.params.id || req.params.issueId);
          if (issue) projectId = issue.project;
        } else if (req.baseUrl.includes('/sprints')) {
          const sprint = await Sprint.findById(req.params.id);
          if (sprint) projectId = sprint.project;
        } else if (req.baseUrl.includes('/milestones')) {
          const milestone = await Milestone.findById(req.params.id);
          if (milestone) projectId = milestone.project;
        }
      }

      if (!projectId) {
        // If operation is not project-scoped, allow through if user is logged in
        return next();
      }

      const userRole = await getUserProjectRole(req.user._id, projectId);
      if (!userRole) {
        res.status(403);
        return next(new Error('You are not a member of this project'));
      }

      req.projectRole = userRole;

      if (hasPermission(userRole, requiredPermission)) {
        return next();
      }

      res.status(403);
      return next(new Error(`Permission denied (${requiredPermission}) for role: ${userRole}`));
    } catch (error) {
      next(error);
    }
  };
};

const checkAllowedRoles = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      let projectId = req.params.projectId || req.params.id || req.body.project || req.query.projectId;
      
      if (!projectId && req.params.id) {
        const task = await Task.findById(req.params.id);
        if (task) projectId = task.project;
      }

      if (!projectId) return next();

      const userRole = await getUserProjectRole(req.user._id, projectId);
      if (!userRole || !allowedRoles.includes(userRole)) {
        res.status(403);
        return next(new Error(`Action restricted to roles: ${allowedRoles.join(', ')}`));
      }

      req.projectRole = userRole;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { checkProjectPermission, checkAllowedRoles };
