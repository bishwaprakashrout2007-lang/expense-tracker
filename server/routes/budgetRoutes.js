const express = require('express');
const { check } = require('express-validator');
const {
  createOrUpdateBudget,
  getBudgets,
  getBudgetByMonth,
  deleteBudget,
  getBudgetStatus,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect); // Protect all routes

router
  .route('/')
  .post(
    [
      check('month', 'Month is required and must be between 1 and 12').isInt({ min: 1, max: 12 }),
      check('year', 'Year is required and must be a valid year number').isInt({ min: 2000, max: 2100 }),
      check('totalBudget', 'Total Budget must be a non-negative number').isFloat({ min: 0 }),
      validate,
    ],
    createOrUpdateBudget
  )
  .get(getBudgets);

router.get('/:month/:year', getBudgetByMonth);
router.get('/status/:month/:year', getBudgetStatus);
router.delete('/:id', deleteBudget);

module.exports = router;
