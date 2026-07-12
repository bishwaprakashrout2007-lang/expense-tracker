const { db } = require('../config/db');

// @desc    Add new income
// @route   POST /api/income
// @access  Private
const addIncome = async (req, res, next) => {
  try {
    const { title, amount, category, description, date } = req.body;

    const newIncome = {
      userId: req.user._id.toString(),
      title: title || '',
      amount: parseFloat(amount) || 0,
      category: category || 'Other',
      description: description || '',
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('incomes').add(newIncome);
    const income = {
      _id: docRef.id,
      ...newIncome
    };

    res.status(201).json({
      success: true,
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all incomes with query parameters
// @route   GET /api/income
// @access  Private
const getIncomes = async (req, res, next) => {
  try {
    const { search, category, startDate, endDate, sortBy, sortOrder } = req.query;

    const snapshot = await db.collection('incomes')
      .where('userId', '==', req.user._id.toString())
      .get();

    let incomes = [];
    snapshot.forEach((doc) => {
      incomes.push({ _id: doc.id, ...doc.data() });
    });

    // 1. Search filter: title or description regex match case-insensitive
    if (search) {
      const searchLower = search.toLowerCase();
      incomes = incomes.filter(inc => 
        (inc.title && inc.title.toLowerCase().includes(searchLower)) ||
        (inc.description && inc.description.toLowerCase().includes(searchLower))
      );
    }

    // 2. Category filter
    if (category && category !== 'All') {
      incomes = incomes.filter(inc => inc.category === category);
    }

    // 3. Date range filter
    if (startDate || endDate) {
      if (startDate) {
        const start = new Date(startDate);
        incomes = incomes.filter(inc => new Date(inc.date) >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        incomes = incomes.filter(inc => new Date(inc.date) <= end);
      }
    }

    // 4. Sort definition
    const sortField = sortBy || 'date';
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    incomes.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle dates specifically
      if (sortField === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return -1 * multiplier;
      if (valA > valB) return 1 * multiplier;
      return 0;
    });

    res.json({
      success: true,
      count: incomes.length,
      data: incomes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get income by ID
// @route   GET /api/income/:id
// @access  Private
const getIncomeById = async (req, res, next) => {
  try {
    const docRef = db.collection('incomes').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().userId !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found',
      });
    }

    const income = {
      _id: doc.id,
      ...doc.data()
    };

    res.json({
      success: true,
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update income
// @route   PUT /api/income/:id
// @access  Private
const updateIncome = async (req, res, next) => {
  try {
    const docRef = db.collection('incomes').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().userId !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found',
      });
    }

    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // Make sure we format amount, date, and don't change userId
    if (updates.amount !== undefined) updates.amount = parseFloat(updates.amount) || 0;
    if (updates.date !== undefined) updates.date = new Date(updates.date).toISOString();
    delete updates.userId;
    delete updates._id;

    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    const income = {
      _id: docRef.id,
      ...updatedDoc.data()
    };

    res.json({
      success: true,
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = async (req, res, next) => {
  try {
    const docRef = db.collection('incomes').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().userId !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found',
      });
    }

    await docRef.delete();

    res.json({
      success: true,
      message: 'Income record removed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
};
