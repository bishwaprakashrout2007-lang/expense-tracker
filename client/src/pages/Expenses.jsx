import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SearchFilter from '../components/ui/SearchFilter';
import { expenseApi } from '../api/financeApi';
import toast from 'react-hot-toast';
import { MdAdd, MdCurrencyRupee, MdOutlineModeEditOutline, MdOutlineDeleteOutline } from 'react-icons/md';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [idToDelete, setIdToDelete] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Filters states
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const categories = ['Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Bills', 'Other'];

  const fetchExpenses = async () => {
    try {
      const res = await expenseApi.getAll({
        search,
        category: filterCategory,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });
      if (res.success) {
        setExpenses(res.data);
      }
    } catch (error) {
      console.error('Failed to load expense records:', error);
      toast.error('Failed to retrieve expense list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [search, filterCategory, startDate, endDate, sortBy, sortOrder]);

  const openAddModal = () => {
    setCurrentExpense(null);
    setTitle('');
    setAmount('');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (expense) => {
    setCurrentExpense(expense);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDate(new Date(expense.date).toISOString().split('T')[0]);
    setDescription(expense.description || '');
    setModalOpen(true);
  };

  const openDeleteModal = (id) => {
    setIdToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !category || !date) {
      toast.error('Please complete all required fields');
      return;
    }

    setSubmitLoading(true);
    const payload = { title, amount: parseFloat(amount), category, date, description };

    try {
      if (currentExpense) {
        // Edit mode
        const res = await expenseApi.update(currentExpense._id, payload);
        if (res.success) {
          toast.success('Expense entry updated successfully');
          fetchExpenses();
          setModalOpen(false);
        }
      } else {
        // Add mode
        const res = await expenseApi.add(payload);
        if (res.success) {
          toast.success('Expense entry added successfully');
          fetchExpenses();
          setModalOpen(false);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save expense log');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!idToDelete) return;
    setSubmitLoading(true);
    try {
      const res = await expenseApi.delete(idToDelete);
      if (res.success) {
        toast.success('Expense entry removed');
        fetchExpenses();
        setDeleteModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove expense record');
    } finally {
      setSubmitLoading(false);
      setIdToDelete(null);
    }
  };

  const categoryOptions = categories.map((cat) => ({ value: cat, label: cat }));

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-row justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Expense Tracking
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
            Monitor and limit your outgoing transactions.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          icon={<MdAdd className="w-5 h-5" />}
          className="shadow-md bg-rose-500 hover:bg-rose-600 focus:ring-rose-500/20"
        >
          Add Expense
        </Button>
      </div>

      {/* Search & filters component */}
      <SearchFilter
        search={search}
        setSearch={setSearch}
        category={filterCategory}
        setCategory={setFilterCategory}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        categories={categories}
      />

      {/* List cards/tables */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : expenses.length === 0 ? (
        <Card>
          <EmptyState
            title="No expenses registered"
            description="You don't have any expense entries matching your current filters. Log an expenditure to begin!"
            actionButton={
              <Button onClick={openAddModal} icon={<MdAdd className="w-4 h-4" />} className="bg-rose-500 hover:bg-rose-600">
                Add Expense
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="pb-4 font-semibold">Title</th>
                  <th className="pb-4 font-semibold">Category</th>
                  <th className="pb-4 font-semibold">Date</th>
                  <th className="pb-4 font-semibold">Description</th>
                  <th className="pb-4 font-semibold text-right">Amount</th>
                  <th className="pb-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {expenses.map((item) => (
                  <tr
                    key={item._id}
                    className="text-sm text-slate-700 dark:text-slate-355 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="py-4 font-semibold text-slate-850 dark:text-slate-205">
                      {item.title}
                    </td>
                    <td className="py-4">
                      <Badge content={item.category} />
                    </td>
                    <td className="py-4 text-xs font-medium">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 text-xs text-slate-450 dark:text-slate-400 max-w-xs truncate">
                      {item.description || <span className="text-slate-300 dark:text-slate-600">-</span>}
                    </td>
                    <td className="py-4 text-right font-bold text-rose-550 dark:text-rose-450">
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                          title="Edit"
                        >
                          <MdOutlineModeEditOutline className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(item._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-550 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          title="Delete"
                        >
                          <MdOutlineDeleteOutline className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentExpense ? 'Edit Expense Record' : 'Register New Expense'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Expense Details / Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weekly Groceries"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Amount (₹)"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              icon={<MdCurrencyRupee className="w-5 h-5" />}
              required
            />
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categoryOptions}
              required
            />
          </div>

          <Input
            label="Date Transacted"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Description (Optional)
            </label>
            <textarea
              className="w-full glass-input px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-800 dark:text-slate-100 min-h-[100px] outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add store details, billing reference, etc..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-rose-500 hover:bg-rose-600 focus:ring-rose-500/20" loading={submitLoading}>
              {currentExpense ? 'Save Changes' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Are you sure you want to delete this expense record? This action is permanent and cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={submitLoading}>
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Expenses;
