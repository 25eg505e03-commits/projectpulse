const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  assignTask,
  assignSprint,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { checkProjectPermission } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, checkProjectPermission('task:write'), createTask)
  .get(protect, getTasks);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, checkProjectPermission('task:write'), updateTask)
  .delete(protect, checkProjectPermission('task:delete'), deleteTask);

router.patch('/:id/status', protect, checkProjectPermission('task:status'), updateTaskStatus);
router.patch('/:id/assign', protect, checkProjectPermission('task:write'), assignTask);
router.patch('/:id/sprint', protect, checkProjectPermission('sprint:write'), assignSprint);

module.exports = router;
