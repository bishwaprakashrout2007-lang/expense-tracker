const { db } = require('../config/db');

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res, next) => {
  try {
    const { title, amount, category, description, date } = req.body;

    const newExpense = {
      userId: req.user._id.toString(),
      title: title || '',
      amount: parseFloat(amount) || 0,
      category: category || 'Other',
      description: description || '',
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('expenses').add(newExpense);
    const expense = {
      _id: docRef.id,
      ...newExpense
    };

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

    const snapshot = await db.collection('expenses')
      .where('userId', '==', req.user._id.toString())
      .get();

    let expenses = [];
    snapshot.forEach((doc) => {
      expenses.push({ _id: doc.id, ...doc.data() });
    });

    // 1. Search filter: title or description regex match case-insensitive
    if (search) {
      const searchLower = search.toLowerCase();
      expenses = expenses.filter(exp => 
        (exp.title && exp.title.toLowerCase().includes(searchLower)) ||
        (exp.description && exp.description.toLowerCase().includes(searchLower))
      );
    }

    // 2. Category filter
    if (category && category !== 'All') {
      expenses = expenses.filter(exp => exp.category === category);
    }

    // 3. Date range filter
    if (startDate || endDate) {
      if (startDate) {
        const start = new Date(startDate);
        expenses = expenses.filter(exp => new Date(exp.date) >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        expenses = expenses.filter(exp => new Date(exp.date) <= end);
      }
    }

    // 4. Sort definition
    const sortField = sortBy || 'date';
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    expenses.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle dates specifically
      if (sortField === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return -1 * multiplier;
      if (valA > valB) return 1 * multiplier;
      return 0;
    });

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
    const docRef = db.collection('expenses').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().userId !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
      });
    }

    const expense = {
      _id: doc.id,
      ...doc.data()
    };

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
    const docRef = db.collection('expenses').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().userId !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
      });
    }

    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // Make sure we format amount, date, and don't change userId
    if (updates.amount !== undefined) updates.amount = parseFloat(updates.amount) || 0;
    if (updates.date !== undefined) updates.date = new Date(updates.date).toISOString();
    delete updates.userId;
    delete updates._id;

    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    const expense = {
      _id: docRef.id,
      ...updatedDoc.data()
    };

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
    const docRef = db.collection('expenses').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().userId !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found',
      });
    }

    await docRef.delete();

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
