const express = require('express');
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createTeam)
  .get(protect, getTeams);

router.route('/:id')
  .get(protect, getTeamById)
  .put(protect, updateTeam)
  .delete(protect, deleteTeam);

module.exports = router;
