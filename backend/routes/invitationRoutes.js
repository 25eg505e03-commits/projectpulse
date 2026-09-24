const express = require('express');
const router = express.Router();
const {
  createInvitation,
  getInvitations,
  respondInvitation,
} = require('../controllers/invitationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createInvitation)
  .get(protect, getInvitations);

router.patch('/:id/respond', protect, respondInvitation);

module.exports = router;
