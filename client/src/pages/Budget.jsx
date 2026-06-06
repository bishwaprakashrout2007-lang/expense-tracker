import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProgressBar from '../components/ui/ProgressBar';
import { budgetApi } from '../api/financeApi';
import toast from 'react-hot-toast';
import { MdTrendingUp, MdWarning, MdNotificationsActive, MdOutlineSettings } from 'react-icons/md';

const Budget = () => {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [budgetStatus, setBudgetStatus] = useState(null);

  // Month & Year selection
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  // Form edit states
  const [isEditing, setIsEditing] = useState(false);
  const [totalBudget, setTotalBudget] = useState('0');
  const [categoryBudgets, setCategoryBudgets] = useState({
    Food: 0,
    Transport: 0,
    Shopping: 0,
    Education: 0,
    Entertainment: 0,
    Bills: 0,
    Other: 0,
  });

  const categories = ['Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Bills', 'Other'];

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

  const fetchBudgetStatus = async () => {
    setLoading(true);
    try {
      const res = await budgetApi.getStatus(selectedMonth, selectedYear);
      if (res.success) {
        setBudgetStatus(res.data);
        
        // Pre-fill edit form values
        setTotalBudget(String(res.data.totalBudget || 0));
        
        const catLimits = {};
        categories.forEach(cat => {
          const item = res.data.categories.find(c => c.category === cat);
          catLimits[cat] = item ? item.limit : 0;
        });
        setCategoryBudgets(catLimits);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load budget details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetStatus();
    setIsEditing(false);
  }, [selectedMonth, selectedYear]);

  const handleCategoryLimitChange = (cat, val) => {
    setCategoryBudgets(prev => ({
      ...prev,
      [cat]: val === '' ? 0 : parseFloat(val),
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const payload = {
        month: parseInt(selectedMonth),
        year: parseInt(selectedYear),
        totalBudget: parseFloat(totalBudget),
        categoryBudgets,
      };

      const res = await budgetApi.createOrUpdate(payload);
      if (res.success) {
        toast.success('Monthly budget configuration saved');
        fetchBudgetStatus();
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update monthly budget');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading && !budgetStatus) {
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

  const exceededCategories = budgetStatus?.categories?.filter(cat => cat.exceeded) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Budget Planning
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
            Define spending thresholds to hit your savings goals.
          </p>
        </div>

        {/* Date Selection */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={months}
            className="text-xs"
          />
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={years}
            className="text-xs"
          />
        </div>
      </div>

      {/* Warnings & Alerts banner */}
      {budgetStatus && (
        <div className="space-y-3">
          {budgetStatus.totalExceeded && (
            <div className="flex gap-3 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-800 dark:text-rose-455 font-bold text-sm items-center animate-pulse-subtle">
              <MdWarning className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <div>
                Overall Budget Alert: Your spending this month ({formatCurrency(budgetStatus.totalSpent)}) has exceeded your overall budget limit ({formatCurrency(budgetStatus.totalBudget)}).
              </div>
            </div>
          )}

          {exceededCategories.length > 0 && (
            <div className="flex gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-350 font-bold text-sm items-start">
              <MdNotificationsActive className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Category Thresholds Exceeded:</p>
                <ul className="list-disc list-inside text-xs space-y-0.5 pl-1 font-semibold">
                  {exceededCategories.map((cat, idx) => (
                    <li key={idx}>
                      Spent <strong>{formatCurrency(cat.spent)}</strong> on {cat.category} (Limit: {formatCurrency(cat.limit)})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Budget display / configuration card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Budget Setup
            </h3>
            {!isEditing && budgetStatus && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1"
              >
                <MdOutlineSettings /> Configure
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                label="Overall Monthly Limit (₹)"
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="0.00"
                required
              />

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Category Limits (Optional)
                </h4>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <Input
                      key={cat}
                      label={`${cat} (₹)`}
                      type="number"
                      value={categoryBudgets[cat] || ''}
                      onChange={(e) => handleCategoryLimitChange(cat, e.target.value)}
                      placeholder="No Limit"
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" loading={submitLoading} className="flex-1">
                  Save Limits
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              {/* Overall Circular or display details */}
              <div className="text-center py-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/30">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
                  Overall Budget Limit
                </p>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                  {formatCurrency(budgetStatus?.totalBudget)}
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-2">
                  Spent {formatCurrency(budgetStatus?.totalSpent)} ({budgetStatus?.totalPercentage}%)
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 font-semibold">
                  <span>Usage Rate</span>
                  <span>{budgetStatus?.totalPercentage}%</span>
                </div>
                <ProgressBar
                  value={budgetStatus?.totalSpent || 0}
                  max={budgetStatus?.totalBudget || 1}
                  suffix=""
                />
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                Category specific budget alerts trigger automatically when category aggregates exceed settings.
              </p>
            </div>
          )}
        </Card>

        {/* Category Budget Details */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Spending vs Category Limits
            </h3>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
              <MdTrendingUp /> Budget Coverage
            </span>
          </div>

          <div className="space-y-6">
            {budgetStatus?.categories?.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {cat.category}
                    </span>
                    {cat.exceeded && (
                      <span className="ml-2 text-2xs font-extrabold text-rose-500 uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        Over Limit
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                    {formatCurrency(cat.spent)} spent / {cat.limit > 0 ? formatCurrency(cat.limit) : 'No Limit'}
                  </span>
                </div>

                <ProgressBar
                  value={cat.spent}
                  max={cat.limit > 0 ? cat.limit : Math.max(cat.spent, 1)}
                  suffix=""
                />
              </div>
            ))}

            {(!budgetStatus || budgetStatus.categories.length === 0) && (
              <div className="text-center py-12 text-slate-400">
                Log some transactions to see Category Progress.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Budget;
