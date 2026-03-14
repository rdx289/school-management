// routes/classes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { pool } = require('../config/database');

// GET all classes
router.get('/', authenticate, async (req, res) => {
  try {
    const [classes] = await pool.query(
      `SELECT c.*, COUNT(s.id) as student_count
       FROM classes c
       LEFT JOIN students s ON c.id = s.class_id AND s.is_active = TRUE
       GROUP BY c.id ORDER BY c.name, c.section`
    );
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch classes.' });
  }
});

// POST create class
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, section, capacity, room_number } = req.body;
    const [result] = await pool.query(
      'INSERT INTO classes (name, section, capacity, room_number) VALUES (?, ?, ?, ?)',
      [name, section, capacity || 40, room_number]
    );
    res.status(201).json({ success: true, message: 'Class created.', data: { id: result.insertId } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Class/Section already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to create class.' });
  }
});

// DELETE class
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM classes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Class deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete class.' });
  }
});

// GET subjects
router.get('/subjects', authenticate, async (req, res) => {
  try {
    const [subjects] = await pool.query('SELECT * FROM subjects ORDER BY name');
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subjects.' });
  }
});

module.exports = router;
