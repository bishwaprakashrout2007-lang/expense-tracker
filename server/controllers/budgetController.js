const { db } = require('../config/db');

// @desc    Create or update monthly budget
// @route   POST /api/budgets
// @access  Private
const createOrUpdateBudget = async (req, res, next) => {
  try {
    const { month, year, totalBudget, categoryBudgets } = req.body;
    const userId = req.user._id.toString();
    const m = parseInt(month);
    const y = parseInt(year);

    const budgetsRef = db.collection('budgets');
    
    // Find if budget exists
    const query = await budgetsRef
      .where('userId', '==', userId)
      .where('month', '==', m)
      .where('year', '==', y)
      .limit(1)
      .get();

    let budget = null;
    let budgetId = null;

    const budgetData = {
      userId,
      month: m,
      year: y,
      totalBudget: parseFloat(totalBudget) || 0,
      categoryBudgets: categoryBudgets || {},
      updatedAt: new Date().toISOString()
    };

    if (!query.empty) {
      const doc = query.docs[0];
      budgetId = doc.id;
      await budgetsRef.doc(budgetId).update(budgetData);
      budget = { _id: budgetId, ...doc.data(), ...budgetData };
    } else {
      budgetData.createdAt = new Date().toISOString();
      const docRef = await budgetsRef.add(budgetData);
      budgetId = docRef.id;
      budget = { _id: budgetId, ...budgetData };
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
    const snapshot = await db.collection('budgets')
      .where('userId', '==', req.user._id.toString())
      .get();

    let budgets = [];
    snapshot.forEach((doc) => {
      budgets.push({ _id: doc.id, ...doc.data() });
    });

    // Sort by year desc, month desc in memory
    budgets.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.month - a.month;
    });

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
    const userId = req.user._id.toString();
    const m = parseInt(month);
    const y = parseInt(year);

    const query = await db.collection('budgets')
      .where('userId', '==', userId)
      .where('month', '==', m)
      .where('year', '==', y)
      .limit(1)
      .get();

    if (query.empty) {
      return res.json({
        success: true,
        data: null,
      });
    }

    const doc = query.docs[0];
    const budget = { _id: doc.id, ...doc.data() };

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
    const docRef = db.collection('budgets').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().userId !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Budget record not found',
      });
    }

    await docRef.delete();

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
    const userId = req.user._id.toString();
    
    const m = parseInt(month);
    const y = parseInt(year);

    // Get budget
    const budgetQuery = await db.collection('budgets')
      .where('userId', '==', userId)
      .where('month', '==', m)
      .where('year', '==', y)
      .limit(1)
      .get();

    let budget = null;
    if (!budgetQuery.empty) {
      const doc = budgetQuery.docs[0];
      budget = { _id: doc.id, ...doc.data() };
    }

    // Define dates for filtering
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);

    // Get expenses of this month
    const expensesSnapshot = await db.collection('expenses')
      .where('userId', '==', userId)
      .get();

    let expenses = [];
    expensesSnapshot.forEach((doc) => {
      const data = doc.data();
      const expDate = new Date(data.date);
      if (expDate >= startDate && expDate <= endDate) {
        expenses.push({ _id: doc.id, ...data });
      }
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
    const definedCategoryBudgets = budget.categoryBudgets || {};

    const allCategories = ['Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Bills', 'Other'];

    allCategories.forEach((cat) => {
      const limit = definedCategoryBudgets[cat] || 0;
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
