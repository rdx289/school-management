// controllers/studentController.js
// Full CRUD operations for student management

const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

/**
 * GET /api/students
 * Returns paginated list of students with optional filters
 */
const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', class_id = '', gender = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE s.is_active = TRUE';
    const params = [];

    if (search) {
      whereClause += ' AND (s.name LIKE ? OR s.student_id LIKE ? OR s.parent_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (class_id) {
      whereClause += ' AND s.class_id = ?';
      params.push(class_id);
    }
    if (gender) {
      whereClause += ' AND s.gender = ?';
      params.push(gender);
    }

    const [students] = await pool.query(
      `SELECT s.*, c.name as class_name, c.section
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM students s ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: students,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students.' });
  }
};

/**
 * GET /api/students/:id
 */
const getStudentById = async (req, res) => {
  try {
    const [students] = await pool.query(
      `SELECT s.*, c.name as class_name, c.section
       FROM students s LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (!students.length) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    res.json({ success: true, data: students[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch student.' });
  }
};

/**
 * POST /api/students
 * Creates student and optional user account
 */
const createStudent = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      name, dob, gender, class_id, phone, email, address,
      parent_name, parent_phone, parent_email, admission_date,
      blood_group, create_account, password
    } = req.body;

    // Generate unique student ID
    const year = new Date().getFullYear().toString().slice(-2);
    const [[{ maxId }]] = await conn.query('SELECT MAX(id) as maxId FROM students');
    const studentId = `STU-${year}${String((maxId || 0) + 1).padStart(4, '0')}`;

    let userId = null;
    // Create login account if requested
    if (create_account && email && password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [userResult] = await conn.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [email.split('@')[0], email, hashedPassword, 'student']
      );
      userId = userResult.insertId;
    }

    const photo = req.file ? req.file.filename : null;

    const [result] = await conn.query(
      `INSERT INTO students (user_id, student_id, name, dob, gender, class_id, phone, email, 
       address, parent_name, parent_phone, parent_email, admission_date, blood_group, photo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, studentId, name, dob, gender, class_id, phone, email,
       address, parent_name, parent_phone, parent_email,
       admission_date || new Date().toISOString().split('T')[0], blood_group, photo]
    );

    await conn.commit();
    res.status(201).json({
      success: true,
      message: 'Student created successfully.',
      data: { id: result.insertId, student_id: studentId }
    });
  } catch (error) {
    await conn.rollback();
    console.error('Create student error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to create student.' });
  } finally {
    conn.release();
  }
};

/**
 * PUT /api/students/:id
 */
const updateStudent = async (req, res) => {
  try {
    const {
      name, dob, gender, class_id, phone, email, address,
      parent_name, parent_phone, parent_email, blood_group
    } = req.body;

    const photo = req.file ? req.file.filename : undefined;
    const updateData = {
      name, dob, gender, class_id, phone, email,
      address, parent_name, parent_phone, parent_email, blood_group
    };
    if (photo) updateData.photo = photo;

    const [result] = await pool.query(
      'UPDATE students SET ? WHERE id = ?',
      [updateData, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    res.json({ success: true, message: 'Student updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update student.' });
  }
};

/**
 * DELETE /api/students/:id (soft delete)
 */
const deleteStudent = async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE students SET is_active = FALSE WHERE id = ?',
      [req.params.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    res.json({ success: true, message: 'Student removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete student.' });
  }
};

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent };
