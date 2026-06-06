import api from './axios';

export const incomeApi = {
  add: (data) => api.post('/income', data).then(r => r.data),
  getAll: (params) => api.get('/income', { params }).then(r => r.data),
  getById: (id) => api.get(`/income/${id}`).then(r => r.data),
  update: (id, data) => api.put(`/income/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/income/${id}`).then(r => r.data),
};

export const expenseApi = {
  add: (data) => api.post('/expenses', data).then(r => r.data),
  getAll: (params) => api.get('/expenses', { params }).then(r => r.data),
  getById: (id) => api.get(`/expenses/${id}`).then(r => r.data),
  update: (id, data) => api.put(`/expenses/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/expenses/${id}`).then(r => r.data),
};

export const budgetApi = {
  createOrUpdate: (data) => api.post('/budgets', data).then(r => r.data),
  getAll: () => api.get('/budgets').then(r => r.data),
  getByMonth: (month, year) => api.get(`/budgets/${month}/${year}`).then(r => r.data),
  delete: (id) => api.delete(`/budgets/${id}`).then(r => r.data),
  getStatus: (month, year) => api.get(`/budgets/status/${month}/${year}`).then(r => r.data),
};

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard').then(r => r.data),
  getMonthly: () => api.get('/analytics/monthly').then(r => r.data),
  getCategoryBreakdown: (month, year) => api.get('/analytics/category-breakdown', { params: { month, year } }).then(r => r.data),
  getTrends: () => api.get('/analytics/trends').then(r => r.data),
};
