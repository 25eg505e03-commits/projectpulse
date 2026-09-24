const Team = require('../models/Team');
const Organization = require('../models/Organization');

// @desc    Create team
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res, next) => {
  try {
    const { organization, name, description, lead, members } = req.body;

    if (!organization || !name) {
      res.status(400);
      return next(new Error('Organization and team name are required'));
    }

    const org = await Organization.findById(organization);
    if (!org) {
      res.status(404);
      return next(new Error('Organization not found'));
    }

    const team = await Team.create({
      organization,
      name,
      description: description || '',
      lead: lead || req.user._id,
      members: members && members.length > 0 ? members : [req.user._id],
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teams
// @route   GET /api/teams
// @access  Private
const getTeams = async (req, res, next) => {
  try {
    const { organization } = req.query;
    const filter = {};
    if (organization) filter.organization = organization;

    const teams = await Team.find(filter)
      .populate('lead', 'name email avatar')
      .populate('members', 'name email avatar phone');

    res.json({
      success: true,
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team by ID
// @route   GET /api/teams/:id
// @access  Private
const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('lead', 'name email avatar')
      .populate('members', 'name email avatar phone');

    if (!team) {
      res.status(404);
      return next(new Error('Team not found'));
    }

    res.json({
      success: true,
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private
const updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      res.status(404);
      return next(new Error('Team not found'));
    }

    team.name = req.body.name || team.name;
    team.description = req.body.description !== undefined ? req.body.description : team.description;
    team.lead = req.body.lead || team.lead;

    if (req.body.members) {
      team.members = req.body.members;
    }

    const updatedTeam = await team.save();

    res.json({
      success: true,
      message: 'Team updated successfully',
      data: updatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private
const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      res.status(404);
      return next(new Error('Team not found'));
    }

    await team.deleteOne();

    res.json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
};
