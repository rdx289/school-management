// controllers/dashboardController.js
// Returns aggregated analytics for the admin dashboard

const { pool } = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    // Run all queries in parallel for performance
    const [
      [[studentStats]],
      [[teacherStats]],
      [[feeStats]],
      [[attendanceToday]],
      [upcomingExams],
      [recentNotices],
      [monthlyFees],
      [classWiseStudents]
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, SUM(gender = "male") as male, SUM(gender = "female") as female FROM students WHERE is_active = TRUE'),
      pool.query('SELECT COUNT(*) as total FROM teachers WHERE is_active = TRUE'),
      pool.query(`SELECT 
        SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as collected,
        SUM(CASE WHEN status IN ('pending','overdue') THEN total_amount ELSE 0 END) as pending
        FROM fees`),
      pool.query(`SELECT 
        COUNT(*) as total_marked,
        SUM(status = 'present') as present,
        SUM(status = 'absent') as absent
        FROM attendance WHERE date = CURDATE()`),
      pool.query(`SELECT e.*, c.name as class_name, s.name as subject_name
        FROM exams e
        LEFT JOIN classes c ON e.class_id = c.id
        LEFT JOIN subjects s ON e.subject_id = s.id
        WHERE e.exam_date >= CURDATE()
        ORDER BY e.exam_date ASC LIMIT 5`),
      pool.query(`SELECT n.*, u.username as posted_by_name FROM notices n
        LEFT JOIN users u ON n.posted_by = u.id
        WHERE n.is_active = TRUE ORDER BY n.created_at DESC LIMIT 5`),
      pool.query(`SELECT 
        DATE_FORMAT(payment_date, '%b') as month,
        SUM(total_amount) as amount
        FROM fees WHERE status = 'paid' AND YEAR(payment_date) = YEAR(CURDATE())
        GROUP BY MONTH(payment_date) ORDER BY MONTH(payment_date)`),
      pool.query(`SELECT c.name, c.section, COUNT(s.id) as student_count
        FROM classes c LEFT JOIN students s ON c.id = s.class_id AND s.is_active = TRUE
        GROUP BY c.id ORDER BY c.name, c.section LIMIT 10`)
    ]);

    res.json({
      success: true,
      data: {
        students: studentStats,
        teachers: teacherStats,
        fees: feeStats,
        attendance_today: attendanceToday,
        upcoming_exams: upcomingExams,
        recent_notices: recentNotices,
        monthly_fees: monthlyFees,
        class_wise_students: classWiseStudents
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data.' });
  }
};

module.exports = { getDashboardStats };
