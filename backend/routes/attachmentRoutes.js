const express = require('express');
const router = express.Router();
const { uploadAttachment, getAttachment } = require('../controllers/attachmentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.single('file'), uploadAttachment);
router.get('/:id', protect, getAttachment);

module.exports = router;
