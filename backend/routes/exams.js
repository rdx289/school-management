// routes/exams.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getExams, createExam, getResults, enterResult } = require('../controllers/examController');

router.get('/', authenticate, getExams);
router.post('/', authenticate, authorize('admin', 'teacher'), createExam);
router.get('/results', authenticate, getResults);
router.post('/results', authenticate, authorize('admin', 'teacher'), enterResult);

module.exports = router;
