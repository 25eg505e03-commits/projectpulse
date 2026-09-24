const Project = require('../models/Project');
const Organization = require('../models/Organization');
const logActivity = require('../utils/activityLogger');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { organization, name, description, projectKey, status, priority, startDate, endDate, members } = req.body;

    if (!organization || !name || !projectKey) {
      res.status(400);
      return next(new Error('Organization, project name, and project key are required'));
    }

    const org = await Organization.findById(organization);
    if (!org) {
      res.status(404);
      return next(new Error('Organization not found'));
    }

    // Default project members include the owner as project_manager or admin
    let initialMembers = [{ user: req.user._id, projectRole: 'admin' }];
    if (members && Array.isArray(members)) {
      members.forEach(m => {
        if (m.user && m.user.toString() !== req.user._id.toString()) {
          initialMembers.push({
            user: m.user,
            projectRole: m.projectRole || 'developer',
          });
        }
      });
    }

    const project = await Project.create({
      organization,
      name,
      description: description || '',
      projectKey: projectKey.toUpperCase(),
      owner: req.user._id,
      members: initialMembers,
      status: status || 'planning',
      priority: priority || 'medium',
      startDate: startDate || Date.now(),
      endDate,
    });

    await logActivity({
      organization,
      project: project._id,
      user: req.user._id,
      action: 'PROJECT_CREATED',
      entityType: 'Project',
      entityId: project._id,
      description: `${req.user.name} created project "${project.name}" [${project.projectKey}]`,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { organization, status, priority, search, page = 1, limit = 20 } = req.query;

    const filter = {
      'members.user': req.user._id,
    };

    if (organization) filter.organization = organization;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { projectKey: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar phone')
      .populate('organization', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: projects,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar phone')
      .populate('organization', 'name');

    if (!project) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      res.status(403);
      return next(new Error('Access denied. You are not a member of this project'));
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description !== undefined ? req.body.description : project.description;
    project.status = req.body.status || project.status;
    project.priority = req.body.priority || project.priority;
    project.startDate = req.body.startDate || project.startDate;
    project.endDate = req.body.endDate || project.endDate;

    if (req.body.members) {
      project.members = req.body.members;
    }

    const updatedProject = await project.save();

    await logActivity({
      organization: project.organization,
      project: project._id,
      user: req.user._id,
      action: 'PROJECT_UPDATED',
      entityType: 'Project',
      entityId: project._id,
      description: `${req.user.name} updated project details for "${project.name}"`,
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin / Owner only)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    await project.deleteOne();

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update project member role
// @route   POST /api/projects/:id/members
// @access  Private
const addProjectMember = async (req, res, next) => {
  try {
    const { userId, projectRole } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    const existingIndex = project.members.findIndex(
      (m) => m.user.toString() === userId
    );

    if (existingIndex > -1) {
      project.members[existingIndex].projectRole = projectRole || 'developer';
    } else {
      project.members.push({
        user: userId,
        projectRole: projectRole || 'developer',
      });
    }

    await project.save();

    res.json({
      success: true,
      message: 'Project member updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
};
