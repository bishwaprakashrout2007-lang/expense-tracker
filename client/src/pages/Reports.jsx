import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { incomeApi, expenseApi } from '../api/financeApi';
import { exportToPdf } from '../utils/exportPdf';
import { exportToExcel } from '../utils/exportExcel';
import toast from 'react-hot-toast';
import { MdDownload, MdPictureAsPdf, MdOutlineGridOn, MdTimeline } from 'react-icons/md';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });

  const now = new Date();
  const [reportType, setReportType] = useState('All'); // All, Income, Expense
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  const reportTypeOptions = [
    { value: 'All', label: 'All Transactions' },
    { value: 'Income', label: 'Income Only' },
    { value: 'Expense', label: 'Expenses Only' },
  ];

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
  ];

  const generateReportData = async () => {
    setLoading(true);
    try {
      // Find start and end date for that month
      const m = parseInt(selectedMonth);
      const y = parseInt(selectedYear);
      const startDate = new Date(y, m - 1, 1).toISOString();
      const endDate = new Date(y, m, 0, 23, 59, 59, 999).toISOString();

      let incomes = [];
      let expenses = [];

      if (reportType === 'All' || reportType === 'Income') {
        const incRes = await incomeApi.getAll({ startDate, endDate });
        if (incRes.success) {
          incomes = incRes.data.map(item => ({ ...item, type: 'income' }));
        }
      }

      if (reportType === 'All' || reportType === 'Expense') {
        const expRes = await expenseApi.getAll({ startDate, endDate });
        if (expRes.success) {
          expenses = expRes.data.map(item => ({ ...item, type: 'expense' }));
        }
      }

      const merged = [...incomes, ...expenses].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      const totalInc = incomes.reduce((sum, item) => sum + item.amount, 0);
      const totalExp = expenses.reduce((sum, item) => sum + item.amount, 0);

      setTransactions(merged);
      setTotals({
        income: totalInc,
        expense: totalExp,
        balance: totalInc - totalExp,
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to construct data for financial report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReportData();
  }, [reportType, selectedMonth, selectedYear]);

  const handlePdfExport = () => {
    if (transactions.length === 0) {
      toast.error('No transactions available to generate report');
      return;
    }
    const monthName = months.find(m => m.value === selectedMonth).label;
    exportToPdf(reportType, transactions, monthName, selectedYear, totals);
    toast.success('PDF report exported successfully!');
  };

  const handleExcelExport = () => {
    if (transactions.length === 0) {
      toast.error('No transactions available to generate report');
      return;
    }
    const monthName = months.find(m => m.value === selectedMonth).label;
    exportToExcel(reportType, transactions, monthName, selectedYear, totals);
    toast.success('Excel report exported successfully!');
  };

  const formatCurrency = (val) => {
    return `₹${val.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Exportable Reports
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
            Generate and export customized PDF and Excel financial sheets.
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handlePdfExport}
            icon={<MdPictureAsPdf className="w-5 h-5 text-rose-500" />}
            disabled={transactions.length === 0}
            className="flex-1 sm:flex-none"
          >
            Export PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleExcelExport}
            icon={<MdOutlineGridOn className="w-5 h-5 text-emerald-500" />}
            disabled={transactions.length === 0}
            className="flex-1 sm:flex-none"
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filter Options Bar */}
      <Card className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={reportTypeOptions}
          />
          <Select
            label="Month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={months}
          />
          <Select
            label="Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={years}
          />
        </div>
      </Card>

      {/* Sum aggregates cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-white dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/30 rounded-2xl">
          <p className="text-2xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total Revenue
          </p>
          <h4 className="text-xl font-bold text-emerald-500 dark:text-emerald-400">
            {formatCurrency(totals.income)}
          </h4>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/30 rounded-2xl">
          <p className="text-2xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total Expenditures
          </p>
          <h4 className="text-xl font-bold text-rose-500 dark:text-rose-400">
            {formatCurrency(totals.expense)}
          </h4>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/30 rounded-2xl">
          <p className="text-2xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Savings / Balance
          </p>
          <h4
            className={`text-xl font-bold ${
              totals.balance >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-600'
            }`}
          >
            {formatCurrency(totals.balance)}
          </h4>
        </div>
      </div>

      {/* Table Preview */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : transactions.length === 0 ? (
        <Card>
          <EmptyState
            title="No records to report"
            description={`We couldn't locate any items registered as ${reportType} for the selected billing period.`}
          />
        </Card>
      ) : (
        <Card>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <MdTimeline className="text-brand-500 w-5 h-5" /> Report Preview
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              Showing {transactions.length} entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="pb-4 font-semibold">Title</th>
                  <th className="pb-4 font-semibold">Category</th>
                  <th className="pb-4 font-semibold">Type</th>
                  <th className="pb-4 font-semibold">Date</th>
                  <th className="pb-4 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {transactions.map((item) => (
                  <tr
                    key={item._id}
                    className="text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="py-4 font-semibold text-slate-900 dark:text-slate-200">
                      {item.title}
                    </td>
                    <td className="py-4">
                      <Badge content={item.category} />
                    </td>
                    <td className="py-4">
                      <span
                        className={`text-2xs font-extrabold uppercase px-2 py-0.5 rounded border ${
                          item.type === 'income'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 text-xs font-medium">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td
                      className={`py-4 text-right font-bold ${
                        item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Reports;
