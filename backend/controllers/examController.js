// controllers/examController.js

const { pool } = require('../config/database');

const getExams = async (req, res) => {
  try {
    const { class_id } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];
    if (class_id) { whereClause += ' AND e.class_id = ?'; params.push(class_id); }

    const [exams] = await pool.query(
      `SELECT e.*, c.name as class_name, c.section, s.name as subject_name, u.username as created_by_name
       FROM exams e
       LEFT JOIN classes c ON e.class_id = c.id
       LEFT JOIN subjects s ON e.subject_id = s.id
       LEFT JOIN users u ON e.created_by = u.id
       ${whereClause} ORDER BY e.exam_date DESC`,
      params
    );
    res.json({ success: true, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch exams.' });
  }
};

const createExam = async (req, res) => {
  try {
    const { name, exam_type, class_id, subject_id, exam_date, start_time, end_time, total_marks, passing_marks, description } = req.body;
    const [result] = await pool.query(
      `INSERT INTO exams (name, exam_type, class_id, subject_id, exam_date, start_time, end_time, total_marks, passing_marks, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, exam_type, class_id, subject_id, exam_date, start_time, end_time, total_marks || 100, passing_marks || 35, description, req.user.id]
    );
    res.status(201).json({ success: true, message: 'Exam created.', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create exam.' });
  }
};

const getResults = async (req, res) => {
  try {
    const { exam_id, student_id } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];
    if (exam_id) { whereClause += ' AND r.exam_id = ?'; params.push(exam_id); }
    if (student_id) { whereClause += ' AND r.student_id = ?'; params.push(student_id); }

    const [results] = await pool.query(
      `SELECT r.*, s.name as student_name, s.student_id as student_code,
       e.name as exam_name, e.total_marks, e.passing_marks, sub.name as subject_name
       FROM results r
       JOIN students s ON r.student_id = s.id
       JOIN exams e ON r.exam_id = e.id
       LEFT JOIN subjects sub ON e.subject_id = sub.id
       ${whereClause}`,
      params
    );
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch results.' });
  }
};

const enterResult = async (req, res) => {
  try {
    const { exam_id, student_id, marks_obtained, remarks } = req.body;

    // Get exam details to calculate grade
    const [[exam]] = await pool.query('SELECT * FROM exams WHERE id = ?', [exam_id]);
    const percentage = (marks_obtained / exam.total_marks) * 100;
    const is_pass = marks_obtained >= exam.passing_marks;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 35) grade = 'D';

    await pool.query(
      `INSERT INTO results (exam_id, student_id, marks_obtained, grade, remarks, is_pass)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained), grade = VALUES(grade), remarks = VALUES(remarks), is_pass = VALUES(is_pass)`,
      [exam_id, student_id, marks_obtained, grade, remarks, is_pass]
    );
    res.json({ success: true, message: 'Result entered.', data: { grade, is_pass, percentage: percentage.toFixed(1) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to enter result.' });
  }
};

module.exports = { getExams, createExam, getResults, enterResult };
