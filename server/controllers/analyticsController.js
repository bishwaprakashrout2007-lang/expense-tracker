const Income = require('../models/Income');
const Expense = require('../models/Expense');

// Helper to get start and end dates of a given month and year
const getMonthDateRange = (month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
};

// @desc    Get dashboard summary statistics (overall + current month) and recent transactions
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const { startDate: thisMonthStart, endDate: thisMonthEnd } = getMonthDateRange(currentMonth, currentYear);
    
    // Overall Stats
    const incomes = await Income.find({ userId });
    const expenses = await Expense.find({ userId });

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
    const currentBalance = totalIncome - totalExpense;
    
    // Savings percentage: (Balance / Income) * 100
    const savingsPercentage = totalIncome > 0 ? Math.max(0, parseFloat(((currentBalance / totalIncome) * 100).toFixed(2))) : 0;

    // Current Month Stats
    const thisMonthIncomes = incomes.filter(inc => inc.date >= thisMonthStart && inc.date <= thisMonthEnd);
    const thisMonthExpenses = expenses.filter(exp => exp.date >= thisMonthStart && exp.date <= thisMonthEnd);

    const monthlyIncome = thisMonthIncomes.reduce((sum, item) => sum + item.amount, 0);
    const monthlyExpense = thisMonthExpenses.reduce((sum, item) => sum + item.amount, 0);
    const monthlyBalance = monthlyIncome - monthlyExpense;
    const monthlySavingsPercentage = monthlyIncome > 0 ? Math.max(0, parseFloat(((monthlyBalance / monthlyIncome) * 100).toFixed(2))) : 0;

    // Recent transactions (merge Income + Expense)
    const formattedIncomes = thisMonthIncomes.map(item => ({
      _id: item._id,
      title: item.title,
      amount: item.amount,
      category: item.category,
      date: item.date,
      type: 'income',
    }));

    const formattedExpenses = thisMonthExpenses.map(item => ({
      _id: item._id,
      title: item.title,
      amount: item.amount,
      category: item.category,
      date: item.date,
      type: 'expense',
    }));

    const recentTransactions = [...formattedIncomes, ...formattedExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5); // get top 5 recent

    // Dynamic Financial Insights
    const insights = [];
    if (savingsPercentage > 20) {
      insights.push({
        type: 'success',
        message: `Excellent job! Your overall savings rate of ${savingsPercentage}% is well above the recommended 20% budget benchmark.`,
      });
    } else if (savingsPercentage > 0) {
      insights.push({
        type: 'warning',
        message: `Your overall savings rate is ${savingsPercentage}%. Try reducing non-essential shopping or entertainment to hit the 20% mark.`,
      });
    } else {
      insights.push({
        type: 'danger',
        message: 'Your total expenses exceed your income! Consider reviewing your monthly subscriptions and discretionary spending.',
      });
    }

    // High expense categories warning
    const categoriesMap = {};
    thisMonthExpenses.forEach(exp => {
      categoriesMap[exp.category] = (categoriesMap[exp.category] || 0) + exp.amount;
    });

    const topCategory = Object.keys(categoriesMap).reduce((a, b) => (categoriesMap[a] > categoriesMap[b] ? a : b), null);
    if (topCategory && monthlyExpense > 0) {
      const topCatPercent = ((categoriesMap[topCategory] / monthlyExpense) * 100).toFixed(0);
      if (topCatPercent > 40) {
        insights.push({
          type: 'warning',
          message: `Concentration Alert: You have spent ${topCatPercent}% of your monthly expenses on "${topCategory}" alone.`,
        });
      }
    }

    if (monthlyIncome > 0 && monthlyExpense === 0) {
      insights.push({
        type: 'success',
        message: 'No expenses logged this month yet. Great start keeping your balance clean!',
      });
    }

    res.json({
      success: true,
      data: {
        overall: {
          totalIncome,
          totalExpense,
          currentBalance,
          savingsPercentage,
        },
        monthly: {
          income: monthlyIncome,
          expense: monthlyExpense,
          balance: monthlyBalance,
          savingsPercentage: monthlySavingsPercentage,
          monthName: now.toLocaleString('default', { month: 'long' }),
        },
        recentTransactions,
        insights,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly aggregate analysis for the past 6 months
// @route   GET /api/analytics/monthly
// @access  Private
const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const result = [];
    const now = new Date();

    // Loop through past 6 months (including current month)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const monthName = d.toLocaleString('default', { month: 'short' });

      const { startDate, endDate } = getMonthDateRange(m, y);

      const incomes = await Income.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      });

      const expenses = await Expense.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      });

      const incomeTotal = incomes.reduce((sum, item) => sum + item.amount, 0);
      const expenseTotal = expenses.reduce((sum, item) => sum + item.amount, 0);

      result.push({
        month: `${monthName} ${y}`,
        income: incomeTotal,
        expense: expenseTotal,
        balance: incomeTotal - expenseTotal,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current month expense categories breakdown
// @route   GET /api/analytics/category-breakdown
// @access  Private
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;

    const now = new Date();
    const m = month ? parseInt(month) : now.getMonth() + 1;
    const y = year ? parseInt(year) : now.getFullYear();

    const { startDate, endDate } = getMonthDateRange(m, y);

    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const categoryTotals = {};
    let grandTotal = 0;

    // Define all categories to populate zero-values if not present
    const categories = ['Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Bills', 'Other'];
    categories.forEach(cat => {
      categoryTotals[cat] = 0;
    });

    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      grandTotal += exp.amount;
    });

    const data = Object.keys(categoryTotals).map(name => ({
      name,
      value: categoryTotals[name],
      percentage: grandTotal > 0 ? parseFloat(((categoryTotals[name] / grandTotal) * 100).toFixed(2)) : 0,
    })).filter(item => item.value > 0 || !month); // return all if general, otherwise filter non-zeroes to keep pie chart nice

    res.json({
      success: true,
      grandTotal,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get income vs expense trend for the past year grouped by month
// @route   GET /api/analytics/trends
// @access  Private
const getTrends = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentYear = now.getFullYear();

    const result = [];

    // Loop through 12 months of current year
    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(currentYear, month - 1, 1).toLocaleString('default', { month: 'short' });
      const { startDate, endDate } = getMonthDateRange(month, currentYear);

      const incomes = await Income.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      });

      const expenses = await Expense.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      });

      const incomeTotal = incomes.reduce((sum, item) => sum + item.amount, 0);
      const expenseTotal = expenses.reduce((sum, item) => sum + item.amount, 0);

      result.push({
        month: monthName,
        income: incomeTotal,
        expense: expenseTotal,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getMonthlyAnalytics,
  getCategoryBreakdown,
  getTrends,
};
