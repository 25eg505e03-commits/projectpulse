const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  updateIssueStatus,
  deleteIssue,
} = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');
const { checkProjectPermission } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, checkProjectPermission('issue:write'), createIssue)
  .get(protect, getIssues);

router.route('/:id')
  .get(protect, getIssueById)
  .put(protect, checkProjectPermission('issue:write'), updateIssue)
  .delete(protect, checkProjectPermission('issue:delete'), deleteIssue);

router.patch('/:id/status', protect, checkProjectPermission('issue:write'), updateIssueStatus);

module.exports = router;
