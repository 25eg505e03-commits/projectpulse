const Attachment = require('../models/Attachment');

// @desc    Upload attachment file
// @route   POST /api/attachments
// @access  Private
const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('No file uploaded'));
    }

    const attachment = await Attachment.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path.replace(/\\/g, '/'),
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: attachment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attachment metadata by ID
// @route   GET /api/attachments/:id
// @access  Private
const getAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findById(req.params.id).populate(
      'uploadedBy',
      'name email'
    );
    if (!attachment) {
      res.status(404);
      return next(new Error('Attachment not found'));
    }
    res.json({
      success: true,
      data: attachment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAttachment,
  getAttachment,
};
