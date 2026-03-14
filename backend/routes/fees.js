// routes/fees.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getFees, collectFee, getFeeStats } = require('../controllers/feesController');

router.get('/', authenticate, getFees);
router.get('/stats', authenticate, getFeeStats);
router.post('/', authenticate, authorize('admin'), collectFee);

module.exports = router;
