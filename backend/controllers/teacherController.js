// controllers/teacherController.js

const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const getTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE t.is_active = TRUE';
    const params = [];
    if (search) {
      whereClause += ' AND (t.name LIKE ? OR t.teacher_id LIKE ? OR t.email LIKE ? OR t.subject LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [teachers] = await pool.query(
      `SELECT t.* FROM teachers t ${whereClause} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM teachers t ${whereClause}`, params
    );

    res.json({
      success: true,
      data: teachers,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch teachers.' });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const [teachers] = await pool.query('SELECT * FROM teachers WHERE id = ?', [req.params.id]);
    if (!teachers.length) return res.status(404).json({ success: false, message: 'Teacher not found.' });
    res.json({ success: true, data: teachers[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch teacher.' });
  }
};

const createTeacher = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { name, email, phone, subject, qualification, joining_date, gender, dob, salary, address } = req.body;

    // Auto-generate teacher ID
    const [[{ maxId }]] = await conn.query('SELECT MAX(id) as maxId FROM teachers');
    const teacherId = `TCH-${String((maxId || 0) + 1).padStart(3, '0')}`;

    // Create login account
    const hashedPassword = await bcrypt.hash('Teacher@123', 10);
    const username = email.split('@')[0];
    const [userResult] = await conn.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'teacher']
    );

    const photo = req.file ? req.file.filename : null;

    const [result] = await conn.query(
      `INSERT INTO teachers (user_id, teacher_id, name, email, phone, subject, qualification, joining_date, gender, dob, salary, address, photo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userResult.insertId, teacherId, name, email, phone, subject, qualification,
       joining_date, gender, dob, salary, address, photo]
    );

    await conn.commit();
    res.status(201).json({
      success: true,
      message: 'Teacher created. Default password: Teacher@123',
      data: { id: result.insertId, teacher_id: teacherId }
    });
  } catch (error) {
    await conn.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to create teacher.' });
  } finally {
    conn.release();
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { name, phone, subject, qualification, joining_date, gender, dob, salary, address } = req.body;
    const updateData = { name, phone, subject, qualification, joining_date, gender, dob, salary, address };
    if (req.file) updateData.photo = req.file.filename;

    const [result] = await pool.query('UPDATE teachers SET ? WHERE id = ?', [updateData, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Teacher not found.' });
    res.json({ success: true, message: 'Teacher updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update teacher.' });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    await pool.query('UPDATE teachers SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Teacher removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete teacher.' });
  }
};

module.exports = { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher };
