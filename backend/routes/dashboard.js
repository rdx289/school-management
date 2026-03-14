// routes/dashboard.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/dashboardController');

router.get('/stats', authenticate, authorize('admin'), getDashboardStats);

module.exports = router;
