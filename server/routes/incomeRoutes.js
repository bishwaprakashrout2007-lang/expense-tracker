const express = require('express');
const { check } = require('express-validator');
const {
  addIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
} = require('../controllers/incomeController');
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
      check('category', 'Category is required').isIn(['Salary', 'Freelancing', 'Business', 'Other']),
      validate,
    ],
    addIncome
  )
  .get(getIncomes);

router
  .route('/:id')
  .get(getIncomeById)
  .put(
    [
      check('title', 'Title is required').optional().notEmpty(),
      check('amount', 'Amount must be a positive number').optional().isFloat({ gt: 0 }),
      check('category', 'Category is required').optional().isIn(['Salary', 'Freelancing', 'Business', 'Other']),
      validate,
    ],
    updateIncome
  )
  .delete(deleteIncome);

module.exports = router;
