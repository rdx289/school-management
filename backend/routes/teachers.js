// routes/teachers.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher } = require('../controllers/teacherController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/teachers/'),
  filename: (req, file, cb) => cb(null, `teacher_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.get('/', authenticate, getTeachers);
router.get('/:id', authenticate, getTeacherById);
router.post('/', authenticate, authorize('admin'), upload.single('photo'), createTeacher);
router.put('/:id', authenticate, authorize('admin'), upload.single('photo'), updateTeacher);
router.delete('/:id', authenticate, authorize('admin'), deleteTeacher);

module.exports = router;
