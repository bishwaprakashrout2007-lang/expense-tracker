const express = require('express');
const {
  getDashboardSummary,
  getMonthlyAnalytics,
  getCategoryBreakdown,
  getTrends,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Protect all routes in this router

router.get('/dashboard', getDashboardSummary);
router.get('/monthly', getMonthlyAnalytics);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/trends', getTrends);

module.exports = router;
