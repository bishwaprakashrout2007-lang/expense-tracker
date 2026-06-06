const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Create or update monthly budget
// @route   POST /api/budgets
// @access  Private
const createOrUpdateBudget = async (req, res, next) => {
  try {
    const { month, year, totalBudget, categoryBudgets } = req.body;
    const userId = req.user._id;

    // Upsert logic: find if exists, then update, else create
    let budget = await Budget.findOne({ userId, month, year });

    if (budget) {
      budget.totalBudget = totalBudget;
      budget.categoryBudgets = categoryBudgets || {};
      await budget.save();
    } else {
      budget = await Budget.create({
        userId,
        month,
        year,
        totalBudget,
        categoryBudgets: categoryBudgets || {},
      });
    }

    res.status(201).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id }).sort({ year: -1, month: -1 });

    res.json({
      success: true,
      count: budgets.length,
      data: budgets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget for specific month and year
// @route   GET /api/budgets/:month/:year
// @access  Private
const getBudgetByMonth = async (req, res, next) => {
  try {
    const { month, year } = req.params;
    const userId = req.user._id;

    const budget = await Budget.findOne({
      userId,
      month: parseInt(month),
      year: parseInt(year),
    });

    if (!budget) {
      return res.json({
        success: true,
        data: null, // Return null instead of error to let frontend know no budget exists yet
      });
    }

    res.json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget record not found',
      });
    }

    await Budget.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Budget record removed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get status of budget limits vs actual spending
// @route   GET /api/budgets/status/:month/:year
// @access  Private
const getBudgetStatus = async (req, res, next) => {
  try {
    const { month, year } = req.params;
    const userId = req.user._id;
    
    const m = parseInt(month);
    const y = parseInt(year);

    // Get budget
    const budget = await Budget.findOne({ userId, month: m, year: y });

    // Define dates for aggregation
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);

    // Get expenses of this month
    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    // Total monthly spending
    const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

    // Aggregate category-wise expenses
    const categorySpending = {};
    expenses.forEach((exp) => {
      categorySpending[exp.category] = (categorySpending[exp.category] || 0) + exp.amount;
    });

    if (!budget) {
      return res.json({
        success: true,
        hasBudget: false,
        totalSpent,
        categories: Object.keys(categorySpending).map((cat) => ({
          category: cat,
          spent: categorySpending[cat],
          limit: 0,
          percentage: 0,
          exceeded: false,
        })),
      });
    }

    // Map limits to spending
    const categoriesStatus = [];
    const definedCategoryBudgets = budget.categoryBudgets || new Map();

    // All categories of expenses
    const allCategories = ['Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Bills', 'Other'];

    allCategories.forEach((cat) => {
      const limit = definedCategoryBudgets.get ? (definedCategoryBudgets.get(cat) || 0) : (definedCategoryBudgets[cat] || 0);
      const spent = categorySpending[cat] || 0;
      const percentage = limit > 0 ? parseFloat(((spent / limit) * 100).toFixed(2)) : 0;
      
      categoriesStatus.push({
        category: cat,
        limit,
        spent,
        percentage,
        exceeded: limit > 0 && spent > limit,
      });
    });

    res.json({
      success: true,
      hasBudget: true,
      totalBudget: budget.totalBudget,
      totalSpent,
      totalPercentage: budget.totalBudget > 0 ? parseFloat(((totalSpent / budget.totalBudget) * 100).toFixed(2)) : 0,
      totalExceeded: budget.totalBudget > 0 && totalSpent > budget.totalBudget,
      categories: categoriesStatus,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdateBudget,
  getBudgets,
  getBudgetByMonth,
  deleteBudget,
  getBudgetStatus,
};
