import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import { analyticsApi } from '../api/financeApi';
import toast from 'react-hot-toast';
import { MdInsertChartOutlined, MdShowChart, MdPieChart } from 'react-icons/md';

const Analytics = () => {
  const [trends, setTrends] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Month & Year filters for Category Breakdown
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = [
    { value: String(now.getFullYear()), label: String(now.getFullYear()) },
    { value: String(now.getFullYear() - 1), label: String(now.getFullYear() - 1) },
    { value: String(now.getFullYear() - 2), label: String(now.getFullYear() - 2) },
  ];

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [trendsRes, categoryRes, monthlyRes] = await Promise.all([
        analyticsApi.getTrends(),
        analyticsApi.getCategoryBreakdown(selectedMonth, selectedYear),
        analyticsApi.getMonthly(),
      ]);

      if (trendsRes.success) setTrends(trendsRes.data);
      if (categoryRes.success) setCategoryData(categoryRes.data);
      if (monthlyRes.success) setMonthlyStats(monthlyRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load financial analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedYear]);

  if (loading && trends.length === 0) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const formatCurrency = (val) => {
    return `₹${(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Financial Analytics
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
          Detailed metrics, aggregates, and visual reports on your cash flow.
        </p>
      </div>

      {/* Grid of Main Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash flow line/area chart */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <MdShowChart className="text-brand-500 w-5 h-5" /> Cash Flow Details (Current Year)
            </h3>
          </div>
          <LineChart data={trends} />
        </Card>

        {/* Monthly expense bar chart */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <MdInsertChartOutlined className="text-rose-500 w-5 h-5" /> Monthly Expenses (Past 6 Months)
            </h3>
          </div>
          <BarChart data={monthlyStats} />
        </Card>
      </div>

      {/* Categories breakdown and table list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (requires filters) */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col sm:flex-row lg:flex-col justify-between gap-3 mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <MdPieChart className="text-amber-500 w-5 h-5" /> Category Breakdown
            </h3>
            <div className="flex gap-2">
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={months}
                className="w-full text-xs"
              />
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                options={years}
                className="w-full text-xs"
              />
            </div>
          </div>
          <PieChart data={categoryData} />
        </Card>

        {/* Monthly Financial Log breakdown list */}
        <Card className="lg:col-span-2">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">
            Recent Months Aggregation Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="pb-4 font-semibold">Month</th>
                  <th className="pb-4 font-semibold text-right">Income</th>
                  <th className="pb-4 font-semibold text-right">Expense</th>
                  <th className="pb-4 font-semibold text-right">Net Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {monthlyStats.map((item, index) => {
                  const savings = item.income - item.expense;
                  return (
                    <tr
                      key={index}
                      className="text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="py-4 font-semibold text-slate-800 dark:text-slate-200">
                        {item.month}
                      </td>
                      <td className="py-4 text-right text-emerald-500 font-medium">
                        {formatCurrency(item.income)}
                      </td>
                      <td className="py-4 text-right text-rose-500 font-medium">
                        {formatCurrency(item.expense)}
                      </td>
                      <td
                        className={`py-4 text-right font-bold ${
                          savings >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatCurrency(savings)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
