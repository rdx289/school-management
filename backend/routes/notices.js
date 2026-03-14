// routes/notices.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getNotices, createNotice, deleteNotice } = require('../controllers/noticeController');

router.get('/', authenticate, getNotices);
router.post('/', authenticate, authorize('admin'), createNotice);
router.delete('/:id', authenticate, authorize('admin'), deleteNotice);

module.exports = router;
