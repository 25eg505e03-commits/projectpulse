const express = require('express');
const router = express.Router();
const {
  createSprint,
  getSprints,
  getSprintById,
  updateSprint,
  startSprint,
  completeSprint,
  deleteSprint,
} = require('../controllers/sprintController');
const { protect } = require('../middleware/authMiddleware');
const { checkProjectPermission } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, checkProjectPermission('sprint:write'), createSprint)
  .get(protect, getSprints);

router.route('/:id')
  .get(protect, getSprintById)
  .put(protect, checkProjectPermission('sprint:write'), updateSprint)
  .delete(protect, checkProjectPermission('sprint:delete'), deleteSprint);

router.patch('/:id/start', protect, checkProjectPermission('sprint:write'), startSprint);
router.patch('/:id/complete', protect, checkProjectPermission('sprint:write'), completeSprint);

module.exports = router;
