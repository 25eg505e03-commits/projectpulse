const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  removeMember,
} = require('../controllers/organizationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createOrganization)
  .get(protect, getOrganizations);

router.route('/:id')
  .get(protect, getOrganizationById)
  .put(protect, updateOrganization)
  .delete(protect, deleteOrganization);

router.delete('/:id/members/:userId', protect, removeMember);

module.exports = router;
