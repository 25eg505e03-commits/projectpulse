const Comment = require('../models/Comment');
const User = require('../models/User');
const createNotification = require('../utils/notificationHelper');
const logActivity = require('../utils/activityLogger');

// @desc    Add comment with @mentions support
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { content, entityType, entityId, projectId } = req.body;

    if (!content || !entityType || !entityId) {
      res.status(400);
      return next(new Error('Content, entity type, and entity ID are required'));
    }

    const comment = await Comment.create({
      author: req.user._id,
      content,
      entityType,
      entityId,
    });

    // Detect @mentions (e.g., @Rahul or @admin)
    const mentionRegex = /@([a-zA-Z0-9_\-\.]+)/g;
    const matches = [...content.matchAll(mentionRegex)];
    if (matches.length > 0) {
      const mentionedNames = matches.map((m) => m[1].toLowerCase());
      const users = await User.find({
        $or: [
          { name: { $in: mentionedNames.map(n => new RegExp(`^${n}$`, 'i')) } },
          { email: { $in: mentionedNames.map(n => new RegExp(`^${n}@`, 'i')) } }
        ]
      });

      for (const u of users) {
        if (u._id.toString() !== req.user._id.toString()) {
          await createNotification({
            user: u._id,
            message: `${req.user.name} mentioned you in a comment on ${entityType}`,
            type: 'mention',
            relatedEntity: { entityType, entityId },
          });
        }
      }
    }

    if (projectId) {
      await logActivity({
        project: projectId,
        user: req.user._id,
        action: 'COMMENT_ADDED',
        entityType,
        entityId,
        description: `${req.user.name} commented on ${entityType}`,
      });
    }

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'name email avatar'
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for an entity
// @route   GET /api/comments/:entityType/:entityId
// @access  Private
const getComments = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;

    const comments = await Comment.find({ entityType, entityId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update own comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.status(404);
      return next(new Error('Comment not found'));
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('You can only edit your own comments'));
    }

    comment.content = req.body.content || comment.content;
    const updatedComment = await comment.save();

    const populatedComment = await Comment.findById(updatedComment._id).populate(
      'author',
      'name email avatar'
    );

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete own comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.status(404);
      return next(new Error('Comment not found'));
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('You can only delete your own comments'));
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addComment,
  getComments,
  updateComment,
  deleteComment,
};
