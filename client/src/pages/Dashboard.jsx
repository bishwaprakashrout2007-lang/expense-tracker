import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import LineChart from '../components/charts/LineChart';
import PieChart from '../components/charts/PieChart';
import { analyticsApi } from '../api/financeApi';
import toast from 'react-hot-toast';
import {
  MdArrowForward,
  MdCurrencyRupee,
  MdMoneyOff,
  MdAccountBalanceWallet,
  MdSavings,
  MdTrendingUp,
  MdInfoOutline,
} from 'react-icons/md';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, trendsRes, catRes] = await Promise.all([
        analyticsApi.getDashboard(),
        analyticsApi.getMonthly(),
        analyticsApi.getCategoryBreakdown(),
      ]);

      if (dashRes.success) setDashboardData(dashRes.data);
      if (trendsRes.success) setTrends(trendsRes.data);
      if (catRes.success) setCategoryData(catRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard statistics:', error);
      toast.error('Could not load financial records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { overall = {}, monthly = {}, recentTransactions = [], insights = [] } = dashboardData || {};

  const formatCurrency = (val) => {
    return `₹${(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Grid */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Financial Dashboard
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
            Overview of your financial performance for {monthly.monthName || 'this month'}.
          </p>
        </div>
        
        {/* Dynamic Monthly Quick Balance summary tag */}
        <div className="px-4 py-2 bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 dark:border-brand-500/30 rounded-xl text-brand-700 dark:text-brand-350 text-xs font-bold">
          Monthly Balance: {formatCurrency(monthly.balance)}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Income"
          value={formatCurrency(overall.totalIncome)}
          icon={<MdCurrencyRupee className="w-6 h-6" />}
          description={`+${formatCurrency(monthly.income)} this month`}
          trend={`${monthly.income > 0 ? '+' : ''}${monthly.income ? 'Logged' : 'No data'}`}
          trendType="up"
        />

        <StatCard
          title="Total Expenses"
          value={formatCurrency(overall.totalExpense)}
          icon={<MdMoneyOff className="w-6 h-6" />}
          description={`${formatCurrency(monthly.expense)} this month`}
          trend={`${monthly.expense ? 'Tracked' : 'No data'}`}
          trendType="down"
        />

        <StatCard
          title="Current Balance"
          value={formatCurrency(overall.currentBalance)}
          icon={<MdAccountBalanceWallet className="w-6 h-6" />}
          description={overall.currentBalance >= 0 ? 'Net positive' : 'Net negative'}
          trend={overall.currentBalance >= 0 ? 'Safe' : 'Overdraft'}
          trendType={overall.currentBalance >= 0 ? 'up' : 'down'}
        />

        <StatCard
          title="Savings Percentage"
          value={`${overall.savingsPercentage}%`}
          icon={<MdSavings className="w-6 h-6" />}
          description={`${monthly.savingsPercentage}% this month`}
          trend={`${overall.savingsPercentage >= 20 ? 'Optimal' : 'Low'}`}
          trendType={overall.savingsPercentage >= 20 ? 'up' : 'down'}
        />
      </div>

      {/* Analytics Charts & Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Trend Chart */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Cash Flow Trend (Last 6 Months)
            </h3>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
              <MdTrendingUp /> Cash Flow Tracking
            </span>
          </div>
          <LineChart data={trends} />
        </Card>

        {/* Categories Pie Chart Breakdown */}
        <Card>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">
            Expense Distribution
          </h3>
          <PieChart data={categoryData} />
        </Card>
      </div>

      {/* Recent Transactions & Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions list */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Recent Transactions
            </h3>
            <Link
              to="/expenses"
              className="text-xs font-bold text-brand-600 dark:text-brand-450 hover:text-brand-700 dark:hover:text-brand-400 flex items-center gap-1 transition-all"
            >
              All Transactions <MdArrowForward />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <EmptyState
              title="No recent transactions"
              description="Your logs for this month are currently clean. Let's register an income or expense!"
              actionButton={
                <div className="flex gap-3">
                  <Link to="/income">
                    <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-semibold hover:bg-emerald-600">
                      Add Income
                    </button>
                  </Link>
                  <Link to="/expenses">
                    <button className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700">
                      Add Expense
                    </button>
                  </Link>
                </div>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Title</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {recentTransactions.map((item) => (
                    <tr
                      key={item._id}
                      className="text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </td>
                      <td className="py-3.5">
                        <Badge content={item.category} />
                      </td>
                      <td className="py-3.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {new Date(item.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td
                        className={`py-3.5 text-right font-bold ${
                          item.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Wealth Insights & Tips */}
        <Card className="flex flex-col h-full">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-5">
            Financial Insights
          </h3>

          <div className="flex-1 space-y-4">
            {insights.map((insight, idx) => {
              const borderColors = {
                success: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300',
                warning: 'border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300',
                danger: 'border-rose-500/20 bg-rose-500/5 text-rose-800 dark:text-rose-300',
              };
              
              const iconColors = {
                success: 'text-emerald-500',
                warning: 'text-amber-500',
                danger: 'text-rose-500',
              };

              return (
                <div
                  key={idx}
                  className={`flex gap-3 p-4 rounded-xl border text-xs font-semibold leading-relaxed ${borderColors[insight.type]}`}
                >
                  <MdInfoOutline className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[insight.type]}`} />
                  <div>
                    <p>{insight.message}</p>
                  </div>
                </div>
              );
            })}

            {insights.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                No financial alerts or insights for your current logs.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 font-medium">
            💡 <strong>Tip:</strong> Keep a budget limit inside the <strong>Budget Planning</strong> tab to receive alerts when spending starts exceeding targets.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
