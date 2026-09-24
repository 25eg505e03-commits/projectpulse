const Organization = require('../models/Organization');
const logActivity = require('../utils/activityLogger');

// @desc    Create new organization
// @route   POST /api/organizations
// @access  Private
const createOrganization = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400);
      return next(new Error('Organization name is required'));
    }

    const organization = await Organization.create({
      name,
      description: description || '',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
    });

    await logActivity({
      organization: organization._id,
      user: req.user._id,
      action: 'ORGANIZATION_CREATED',
      entityType: 'Organization',
      entityId: organization._id,
      description: `${req.user.name} created organization "${organization.name}"`,
    });

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user organizations
// @route   GET /api/organizations
// @access  Private
const getOrganizations = async (req, res, next) => {
  try {
    const organizations = await Organization.find({
      'members.user': req.user._id,
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar phone');

    res.json({
      success: true,
      data: organizations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single organization by ID
// @route   GET /api/organizations/:id
// @access  Private
const getOrganizationById = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar phone');

    if (!organization) {
      res.status(404);
      return next(new Error('Organization not found'));
    }

    const isMember = organization.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      res.status(403);
      return next(new Error('Access denied. You are not a member of this organization'));
    }

    res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private (Admin only)
const updateOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      res.status(404);
      return next(new Error('Organization not found'));
    }

    const member = organization.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!member || member.role !== 'admin') {
      res.status(403);
      return next(new Error('Only organization admins can update settings'));
    }

    organization.name = req.body.name || organization.name;
    organization.description = req.body.description !== undefined ? req.body.description : organization.description;

    const updatedOrg = await organization.save();

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: updatedOrg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private (Owner only)
const deleteOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      res.status(404);
      return next(new Error('Organization not found'));
    }

    if (organization.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Only the organization owner can delete it'));
    }

    await organization.deleteOne();

    res.json({
      success: true,
      message: 'Organization deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from organization
// @route   DELETE /api/organizations/:id/members/:userId
// @access  Private (Admin only)
const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const organization = await Organization.findById(id);

    if (!organization) {
      res.status(404);
      return next(new Error('Organization not found'));
    }

    const currentAdmin = organization.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!currentAdmin || currentAdmin.role !== 'admin') {
      res.status(403);
      return next(new Error('Only organization admins can remove members'));
    }

    if (organization.owner.toString() === userId) {
      res.status(400);
      return next(new Error('Cannot remove the organization owner'));
    }

    organization.members = organization.members.filter(
      (m) => m.user.toString() !== userId
    );

    await organization.save();

    res.json({
      success: true,
      message: 'Member removed from organization successfully',
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  removeMember,
};
