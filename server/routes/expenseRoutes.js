const express = require('express');
const { check } = require('express-validator');
const {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect); // Protect all routes in this router

router
  .route('/')
  .post(
    [
      check('title', 'Title is required').notEmpty(),
      check('amount', 'Amount must be a positive number').isFloat({ gt: 0 }),
      check('category', 'Category is required').isIn([
        'Food',
        'Transport',
        'Shopping',
        'Education',
        'Entertainment',
        'Bills',
        'Other',
      ]),
      validate,
    ],
    addExpense
  )
  .get(getExpenses);

router
  .route('/:id')
  .get(getExpenseById)
  .put(
    [
      check('title', 'Title is required').optional().notEmpty(),
      check('amount', 'Amount must be a positive number').optional().isFloat({ gt: 0 }),
      check('category', 'Category is required').optional().isIn([
        'Food',
        'Transport',
        'Shopping',
        'Education',
        'Entertainment',
        'Bills',
        'Other',
      ]),
      validate,
    ],
    updateExpense
  )
  .delete(deleteExpense);

module.exports = router;
