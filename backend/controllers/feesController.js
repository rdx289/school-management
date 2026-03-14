// controllers/feesController.js

const { pool } = require('../config/database');

const getFees = async (req, res) => {
  try {
    const { page = 1, limit = 10, student_id, status, month, year } = req.query;
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (student_id) { whereClause += ' AND f.student_id = ?'; params.push(student_id); }
    if (status) { whereClause += ' AND f.status = ?'; params.push(status); }
    if (month) { whereClause += ' AND f.month = ?'; params.push(month); }
    if (year) { whereClause += ' AND f.academic_year LIKE ?'; params.push(`%${year}%`); }

    const [fees] = await pool.query(
      `SELECT f.*, s.name as student_name, s.student_id as student_code, c.name as class_name
       FROM fees f
       JOIN students s ON f.student_id = s.id
       LEFT JOIN classes c ON s.class_id = c.id
       ${whereClause}
       ORDER BY f.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM fees f JOIN students s ON f.student_id = s.id ${whereClause}`, params
    );

    res.json({ success: true, data: fees, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch fees.' });
  }
};

const collectFee = async (req, res) => {
  try {
    const { student_id, fee_type, amount, discount = 0, fine = 0, payment_method, academic_year, month, remarks } = req.body;
    const totalAmount = parseFloat(amount) - parseFloat(discount) + parseFloat(fine);

    // Generate receipt number
    const receiptNumber = `RCP-${Date.now()}`;

    const [result] = await pool.query(
      `INSERT INTO fees (student_id, fee_type, amount, discount, fine, total_amount, payment_date, 
       payment_method, status, receipt_number, academic_year, month, collected_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, 'paid', ?, ?, ?, ?, ?)`,
      [student_id, fee_type, amount, discount, fine, totalAmount, payment_method,
       receiptNumber, academic_year, month, req.user.id, remarks]
    );

    res.status(201).json({
      success: true,
      message: 'Fee collected successfully.',
      data: { id: result.insertId, receipt_number: receiptNumber, total_amount: totalAmount }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to collect fee.' });
  }
};

const getFeeStats = async (req, res) => {
  try {
    const [[stats]] = await pool.query(
      `SELECT 
        SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as total_collected,
        SUM(CASE WHEN status = 'pending' OR status = 'overdue' THEN total_amount ELSE 0 END) as total_pending,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
       FROM fees`
    );
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch fee stats.' });
  }
};

module.exports = { getFees, collectFee, getFeeStats };
