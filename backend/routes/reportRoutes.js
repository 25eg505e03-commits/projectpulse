const express = require('express');
const router = express.Router();
const { getProjectReport, getWorkloadReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { checkProjectPermission } = require('../middleware/roleMiddleware');

router.get('/project/:projectId', protect, checkProjectPermission('report:read'), getProjectReport);
router.get('/workload/:projectId', protect, checkProjectPermission('report:read'), getWorkloadReport);

module.exports = router;
