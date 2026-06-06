const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number,
      required: [true, 'Please add a month (1-12)'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Please add a year'],
    },
    totalBudget: {
      type: Number,
      required: [true, 'Please add a total budget amount'],
      min: [0, 'Budget cannot be negative'],
    },
    categoryBudgets: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one budget per user per month/year
BudgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
