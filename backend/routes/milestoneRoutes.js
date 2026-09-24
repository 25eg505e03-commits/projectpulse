const express = require('express');
const router = express.Router();
const {
  createMilestone,
  getMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
} = require('../controllers/milestoneController');
const { protect } = require('../middleware/authMiddleware');
const { checkProjectPermission } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, checkProjectPermission('milestone:write'), createMilestone)
  .get(protect, getMilestones);

router.route('/:id')
  .get(protect, getMilestoneById)
  .put(protect, checkProjectPermission('milestone:write'), updateMilestone)
  .delete(protect, checkProjectPermission('milestone:delete'), deleteMilestone);

module.exports = router;
