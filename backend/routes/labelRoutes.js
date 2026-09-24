const express = require('express');
const router = express.Router();
const {
  createLabel,
  getLabels,
  updateLabel,
  deleteLabel,
} = require('../controllers/labelController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createLabel)
  .get(protect, getLabels);

router.route('/:id')
  .put(protect, updateLabel)
  .delete(protect, deleteLabel);

module.exports = router;
