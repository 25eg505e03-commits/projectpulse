const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { checkProjectPermission } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, checkProjectPermission('project:read'), getProjectById)
  .put(protect, checkProjectPermission('project:write'), updateProject)
  .delete(protect, checkProjectPermission('project:delete'), deleteProject);

router.post('/:id/members', protect, checkProjectPermission('project:write'), addProjectMember);

module.exports = router;
