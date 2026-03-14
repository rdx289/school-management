// routes/students.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/students/'),
  filename: (req, file, cb) => cb(null, `student_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', authenticate, getStudents);
router.get('/:id', authenticate, getStudentById);
router.post('/', authenticate, authorize('admin'), upload.single('photo'), createStudent);
router.put('/:id', authenticate, authorize('admin'), upload.single('photo'), updateStudent);
router.delete('/:id', authenticate, authorize('admin'), deleteStudent);

module.exports = router;
