// controllers/attendanceController.js

const { pool } = require('../config/database');

const getAttendance = async (req, res) => {
  try {
    const { date, class_id, student_id, month, year } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (date) { whereClause += ' AND a.date = ?'; params.push(date); }
    if (class_id) { whereClause += ' AND s.class_id = ?'; params.push(class_id); }
    if (student_id) { whereClause += ' AND a.student_id = ?'; params.push(student_id); }
    if (month && year) {
      whereClause += ' AND MONTH(a.date) = ? AND YEAR(a.date) = ?';
      params.push(month, year);
    }

    const [records] = await pool.query(
      `SELECT a.*, s.name as student_name, s.student_id as student_code, c.name as class_name, c.section
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       LEFT JOIN classes c ON s.class_id = c.id
       ${whereClause}
       ORDER BY a.date DESC, s.name ASC`,
      params
    );
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance.' });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { date, class_id, attendance } = req.body;
    // attendance = [{ student_id, status, remarks }]

    const values = attendance.map(a => [a.student_id, class_id, date, a.status, a.remarks || '', req.user.id]);

    await pool.query(
      `INSERT INTO attendance (student_id, class_id, date, status, remarks, marked_by) VALUES ?
       ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)`,
      [values]
    );
    res.json({ success: true, message: `Attendance marked for ${attendance.length} students.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark attendance.' });
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const { student_id, month, year } = req.query;
    const [summary] = await pool.query(
      `SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
       FROM attendance
       WHERE student_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
      [student_id, month, year]
    );
    res.json({ success: true, data: summary[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch summary.' });
  }
};

module.exports = { getAttendance, markAttendance, getAttendanceSummary };
