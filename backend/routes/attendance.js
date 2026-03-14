// routes/attendance.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAttendance, markAttendance, getAttendanceSummary } = require('../controllers/attendanceController');

router.get('/', authenticate, getAttendance);
router.get('/summary', authenticate, getAttendanceSummary);
router.post('/', authenticate, authorize('admin', 'teacher'), markAttendance);

module.exports = router;
