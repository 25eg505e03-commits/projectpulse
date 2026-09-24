const Invitation = require('../models/Invitation');
const Organization = require('../models/Organization');
const User = require('../models/User');
const createNotification = require('../utils/notificationHelper');

// @desc    Send / Create an invitation
// @route   POST /api/invitations
// @access  Private
const createInvitation = async (req, res, next) => {
  try {
    const { organizationId, email, role } = req.body;

    if (!organizationId || !email) {
      res.status(400);
      return next(new Error('Organization ID and Email are required'));
    }

    const org = await Organization.findById(organizationId);
    if (!org) {
      res.status(404);
      return next(new Error('Organization not found'));
    }

    const isAdmin = org.members.some(
      (m) => m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );
    if (!isAdmin && org.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Only organization admins can invite members'));
    }

    // Check if target user is already a member
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const isAlreadyMember = org.members.some(
        (m) => m.user.toString() === existingUser._id.toString()
      );
      if (isAlreadyMember) {
        res.status(400);
        return next(new Error('User is already a member of this organization'));
      }
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await Invitation.create({
      organization: organizationId,
      email: email.toLowerCase(),
      invitedBy: req.user._id,
      role: role || 'developer',
      token,
      expiresAt,
    });

    // Notify user if already registered on platform
    if (existingUser) {
      await createNotification({
        user: existingUser._id,
        message: `You were invited to join "${org.name}" as ${role || 'developer'}`,
        type: 'invitation',
        relatedEntity: { entityType: 'Invitation', entityId: invitation._id },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user invitations or org invitations
// @route   GET /api/invitations
// @access  Private
const getInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find({
      $or: [
        { email: req.user.email.toLowerCase() },
        { invitedBy: req.user._id },
      ],
    })
      .populate('organization', 'name description')
      .populate('invitedBy', 'name email');

    res.json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to invitation (accept / reject)
// @route   PATCH /api/invitations/:id/respond
// @access  Private
const respondInvitation = async (req, res, next) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      res.status(404);
      return next(new Error('Invitation not found'));
    }

    if (invitation.email.toLowerCase() !== req.user.email.toLowerCase()) {
      res.status(403);
      return next(new Error('This invitation is not addressed to your email address'));
    }

    if (invitation.status !== 'pending') {
      res.status(400);
      return next(new Error(`Invitation has already been ${invitation.status}`));
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      res.status(400);
      return next(new Error('Invitation has expired'));
    }

    if (action === 'accept') {
      invitation.status = 'accepted';
      await invitation.save();

      // Add user to organization
      const org = await Organization.findById(invitation.organization);
      if (org) {
        const isMember = org.members.some(
          (m) => m.user.toString() === req.user._id.toString()
        );
        if (!isMember) {
          org.members.push({
            user: req.user._id,
            role: invitation.role === 'admin' ? 'admin' : 'member',
          });
          await org.save();
        }
      }

      res.json({
        success: true,
        message: 'Invitation accepted! You are now a member of the organization.',
      });
    } else {
      invitation.status = 'rejected';
      await invitation.save();

      res.json({
        success: true,
        message: 'Invitation declined.',
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvitation,
  getInvitations,
  respondInvitation,
};
