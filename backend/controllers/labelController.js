const Label = require('../models/Label');

// @desc    Create label
// @route   POST /api/labels
// @access  Private
const createLabel = async (req, res, next) => {
  try {
    const { project, name, color } = req.body;

    if (!project || !name) {
      res.status(400);
      return next(new Error('Project ID and label name are required'));
    }

    const label = await Label.create({
      project,
      name,
      color: color || '#3b82f6',
    });

    res.status(201).json({
      success: true,
      message: 'Label created successfully',
      data: label,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get labels by project
// @route   GET /api/labels
// @access  Private
const getLabels = async (req, res, next) => {
  try {
    const { project } = req.query;
    const filter = {};
    if (project) filter.project = project;

    const labels = await Label.find(filter).sort({ name: 1 });

    res.json({
      success: true,
      data: labels,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update label
// @route   PUT /api/labels/:id
// @access  Private
const updateLabel = async (req, res, next) => {
  try {
    const label = await Label.findById(req.params.id);
    if (!label) {
      res.status(404);
      return next(new Error('Label not found'));
    }

    label.name = req.body.name || label.name;
    label.color = req.body.color || label.color;

    const updatedLabel = await label.save();

    res.json({
      success: true,
      message: 'Label updated successfully',
      data: updatedLabel,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete label
// @route   DELETE /api/labels/:id
// @access  Private
const deleteLabel = async (req, res, next) => {
  try {
    const label = await Label.findById(req.params.id);
    if (!label) {
      res.status(404);
      return next(new Error('Label not found'));
    }

    await label.deleteOne();

    res.json({
      success: true,
      message: 'Label deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLabel,
  getLabels,
  updateLabel,
  deleteLabel,
};
