const Task = require('../models/Task');
const Sprint = require('../models/Sprint');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notificationHelper');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const {
      project,
      sprint,
      title,
      description,
      type,
      status,
      priority,
      assignee,
      team,
      storyPoints,
      labels,
      dueDate,
      dependencies,
      blockers,
    } = req.body;

    if (!project || !title) {
      res.status(400);
      return next(new Error('Project ID and task title are required'));
    }

    // Check self-dependency
    if (dependencies && Array.isArray(dependencies)) {
      // Will validate during creation
    }

    const task = await Task.create({
      project,
      sprint: sprint || null,
      title,
      description: description || '',
      type: type || 'task',
      status: status || 'todo',
      priority: priority || 'medium',
      assignee: assignee || null,
      reporter: req.user._id,
      team: team || null,
      storyPoints: storyPoints || 1,
      labels: labels || [],
      dueDate,
      dependencies: dependencies || [],
      blockers: blockers || [],
    });

    // If assigned to a sprint, sync sprint's task array
    if (sprint) {
      await Sprint.findByIdAndUpdate(sprint, { $addToSet: { tasks: task._id } });
    }

    // Notify assignee if assigned
    if (assignee) {
      await createNotification({
        user: assignee,
        message: `${req.user.name} assigned task "${task.title}" to you`,
        type: 'task_assigned',
        relatedEntity: { entityType: 'Task', entityId: task._id },
      });
    }

    await logActivity({
      project,
      user: req.user._id,
      action: 'TASK_CREATED',
      entityType: 'Task',
      entityId: task._id,
      description: `${req.user.name} created task "${task.title}"`,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('labels', 'name color')
      .populate('dependencies', 'title status priority');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks with filtering & server-side pagination
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const {
      project,
      sprint,
      unassignedSprint,
      status,
      priority,
      assignee,
      type,
      label,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};
    if (project) filter.project = project;
    if (sprint) filter.sprint = sprint;
    if (unassignedSprint === 'true') filter.sprint = null;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (type) filter.type = type;
    if (label) filter.labels = label;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('labels', 'name color')
      .populate('dependencies', 'title status priority')
      .populate('attachments')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: tasks,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar phone')
      .populate('reporter', 'name email avatar')
      .populate('sprint', 'name status goal')
      .populate('team', 'name')
      .populate('labels', 'name color')
      .populate('dependencies', 'title status priority assignee')
      .populate('attachments');

    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    // Check self-dependency
    if (req.body.dependencies && Array.isArray(req.body.dependencies)) {
      if (req.body.dependencies.some((id) => id.toString() === task._id.toString())) {
        res.status(400);
        return next(new Error('Task cannot depend on itself!'));
      }
    }

    const previousAssignee = task.assignee ? task.assignee.toString() : null;
    const oldSprint = task.sprint ? task.sprint.toString() : null;

    task.title = req.body.title || task.title;
    task.description = req.body.description !== undefined ? req.body.description : task.description;
    task.type = req.body.type || task.type;
    task.status = req.body.status || task.status;
    task.priority = req.body.priority || task.priority;
    task.assignee = req.body.assignee !== undefined ? req.body.assignee : task.assignee;
    task.sprint = req.body.sprint !== undefined ? req.body.sprint : task.sprint;
    task.team = req.body.team !== undefined ? req.body.team : task.team;
    task.storyPoints = req.body.storyPoints !== undefined ? req.body.storyPoints : task.storyPoints;
    task.labels = req.body.labels || task.labels;
    task.dueDate = req.body.dueDate !== undefined ? req.body.dueDate : task.dueDate;
    task.dependencies = req.body.dependencies || task.dependencies;
    task.blockers = req.body.blockers || task.blockers;

    const updatedTask = await task.save();

    // Sync Sprint references if sprint changed
    const newSprint = updatedTask.sprint ? updatedTask.sprint.toString() : null;
    if (oldSprint !== newSprint) {
      if (oldSprint) {
        await Sprint.findByIdAndUpdate(oldSprint, { $pull: { tasks: task._id } });
      }
      if (newSprint) {
        await Sprint.findByIdAndUpdate(newSprint, { $addToSet: { tasks: task._id } });
      }
    }

    // Notify new assignee if changed
    if (updatedTask.assignee && updatedTask.assignee.toString() !== previousAssignee) {
      await createNotification({
        user: updatedTask.assignee,
        message: `${req.user.name} assigned task "${updatedTask.title}" to you`,
        type: 'task_assigned',
        relatedEntity: { entityType: 'Task', entityId: updatedTask._id },
      });
    }

    await logActivity({
      project: updatedTask.project,
      user: req.user._id,
      action: 'TASK_UPDATED',
      entityType: 'Task',
      entityId: updatedTask._id,
      description: `${req.user.name} updated task "${updatedTask.title}"`,
    });

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('labels', 'name color')
      .populate('dependencies', 'title status priority');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Patch Task Status (Kanban Drag and Drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['todo', 'in-progress', 'review', 'done'].includes(status)) {
      res.status(400);
      return next(new Error('Invalid task status'));
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    await logActivity({
      project: task.project,
      user: req.user._id,
      action: 'TASK_STATUS_CHANGED',
      entityType: 'Task',
      entityId: task._id,
      description: `${req.user.name} moved "${task.title}" from ${oldStatus.toUpperCase()} to ${status.toUpperCase()}`,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('labels', 'name color');

    res.json({
      success: true,
      message: `Task status updated to ${status}`,
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Patch Task Assignee
// @route   PATCH /api/tasks/:id/assign
// @access  Private
const assignTask = async (req, res, next) => {
  try {
    const { assignee } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    task.assignee = assignee || null;
    await task.save();

    if (assignee) {
      await createNotification({
        user: assignee,
        message: `${req.user.name} assigned task "${task.title}" to you`,
        type: 'task_assigned',
        relatedEntity: { entityType: 'Task', entityId: task._id },
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar');

    res.json({
      success: true,
      message: 'Task assignee updated',
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Patch Task Sprint
// @route   PATCH /api/tasks/:id/sprint
// @access  Private
const assignSprint = async (req, res, next) => {
  try {
    const { sprintId } = req.body; // null for backlog
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    const oldSprint = task.sprint ? task.sprint.toString() : null;
    task.sprint = sprintId || null;
    await task.save();

    if (oldSprint) {
      await Sprint.findByIdAndUpdate(oldSprint, { $pull: { tasks: task._id } });
    }
    if (sprintId) {
      await Sprint.findByIdAndUpdate(sprintId, { $addToSet: { tasks: task._id } });
    }

    res.json({
      success: true,
      message: sprintId ? 'Task added to sprint' : 'Task moved to backlog',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    if (task.sprint) {
      await Sprint.findByIdAndUpdate(task.sprint, { $pull: { tasks: task._id } });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  assignTask,
  assignSprint,
  deleteTask,
};
