const Expense = require('../models/Expense');

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res, next) => {
  try {
    const { title, amount, category, description, date } = req.body;

    const expense = await Expense.create({
      userId: req.user._id,
      title,
      amount,
      category,
      description,
      date: date || Date.now(),
    });

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all expenses with query parameters
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { search, category, startDate, endDate, sortBy, sortOrder } = req.query;

    // Construct query object
    const query = { userId: req.user._id };

    // Search query: title or description regex match
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of that day (23:59:59)
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Sort definition
    let sort = {};
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      sort[sortBy] = order;
    } else {
      sort.date = -1; // Default: newest first
    }

    const expenses = await Expense.find(query).sort(sort);

    res.json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
      });
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
      });
    }

    // Update fields
    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
      });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Expense record removed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
