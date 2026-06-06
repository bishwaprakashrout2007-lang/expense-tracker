const Income = require('../models/Income');

// @desc    Add new income
// @route   POST /api/income
// @access  Private
const addIncome = async (req, res, next) => {
  try {
    const { title, amount, category, description, date } = req.body;

    const income = await Income.create({
      userId: req.user._id,
      title,
      amount,
      category,
      description,
      date: date || Date.now(),
    });

    res.status(201).json({
      success: true,
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all incomes with query parameters
// @route   GET /api/income
// @access  Private
const getIncomes = async (req, res, next) => {
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

    const incomes = await Income.find(query).sort(sort);

    res.json({
      success: true,
      count: incomes.length,
      data: incomes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get income by ID
// @route   GET /api/income/:id
// @access  Private
const getIncomeById = async (req, res, next) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, userId: req.user._id });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found',
      });
    }

    res.json({
      success: true,
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update income
// @route   PUT /api/income/:id
// @access  Private
const updateIncome = async (req, res, next) => {
  try {
    let income = await Income.findOne({ _id: req.params.id, userId: req.user._id });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found',
      });
    }

    // Update fields
    income = await Income.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, userId: req.user._id });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found',
      });
    }

    await Income.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Income record removed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
};
