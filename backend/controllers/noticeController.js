// controllers/noticeController.js

const { pool } = require('../config/database');

const getNotices = async (req, res) => {
  try {
    const { audience } = req.query;
    let whereClause = "WHERE n.is_active = TRUE AND (n.expiry_date IS NULL OR n.expiry_date >= CURDATE())";
    const params = [];
    if (audience) {
      whereClause += " AND (n.audience = 'all' OR n.audience = ?)";
      params.push(audience);
    }
    const [notices] = await pool.query(
      `SELECT n.*, u.username as posted_by_name FROM notices n
       LEFT JOIN users u ON n.posted_by = u.id
       ${whereClause} ORDER BY n.priority DESC, n.created_at DESC`,
      params
    );
    res.json({ success: true, data: notices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notices.' });
  }
};

const createNotice = async (req, res) => {
  try {
    const { title, content, priority, audience, publish_date, expiry_date } = req.body;
    const [result] = await pool.query(
      `INSERT INTO notices (title, content, priority, audience, publish_date, expiry_date, posted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, content, priority || 'normal', audience || 'all', publish_date, expiry_date, req.user.id]
    );
    res.status(201).json({ success: true, message: 'Notice posted.', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to post notice.' });
  }
};

const deleteNotice = async (req, res) => {
  try {
    await pool.query('UPDATE notices SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notice removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete notice.' });
  }
};

module.exports = { getNotices, createNotice, deleteNotice };
