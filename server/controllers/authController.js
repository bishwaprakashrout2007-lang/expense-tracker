const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../config/db');

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'financeflow_jwt_secret_dev_key_123456789', {
    expiresIn: '30d',
  });
};

const buildUserResponse = (user) => ({
  success: true,
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  profilePicture: user.profilePicture,
  token: generateToken(user._id),
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const emailKey = email.toLowerCase().trim();

    // Check if user already exists
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', emailKey).limit(1).get();

    if (!snapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = {
      name: name || '',
      email: emailKey,
      password: hashedPassword,
      phone: '',
      profilePicture: '',
      provider: 'email',
      firebaseUid: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await usersRef.add(newUser);
    const user = {
      _id: docRef.id,
      ...newUser
    };

    res.status(201).json(buildUserResponse(user));
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const emailKey = email.toLowerCase().trim();

    // Check for user email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', emailKey).limit(1).get();

    if (snapshot.empty) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const doc = snapshot.docs[0];
    const user = { _id: doc.id, ...doc.data() };

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.json(buildUserResponse(user));
  } catch (error) {
    next(error);
  }
};

// @desc    Sync Firebase / Google user
// @route   POST /api/auth/firebase
// @access  Public
const syncFirebaseUser = async (req, res, next) => {
  try {
    const { name, email, phone, profilePicture, firebaseUid, provider } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({
        success: false,
        message: 'Firebase UID is required',
      });
    }

    const usersRef = db.collection('users');
    let userDoc = null;
    let userId = null;

    // 1. Find by firebaseUid
    let query = await usersRef.where('firebaseUid', '==', firebaseUid).limit(1).get();
    if (!query.empty) {
      userDoc = query.docs[0];
      userId = userDoc.id;
    } else {
      // 2. Find by email
      if (email) {
        query = await usersRef.where('email', '==', email.toLowerCase().trim()).limit(1).get();
        if (!query.empty) {
          userDoc = query.docs[0];
          userId = userDoc.id;
        }
      }
    }

    if (!userDoc) {
      // Create new user
      const newUser = {
        name: name || '',
        email: email ? email.toLowerCase().trim() : '',
        phone: phone || '',
        profilePicture: profilePicture || '',
        provider: provider || 'firebase',
        firebaseUid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await usersRef.add(newUser);
      userId = docRef.id;
      const createdDoc = await docRef.get();
      userDoc = createdDoc;
    } else {
      // Update existing
      const updates = {
        updatedAt: new Date()
      };
      if (name) updates.name = name;
      if (email) updates.email = email.toLowerCase().trim();
      if (phone) updates.phone = phone;
      if (profilePicture) updates.profilePicture = profilePicture;
      if (provider) updates.provider = provider;
      updates.firebaseUid = firebaseUid;

      await usersRef.doc(userId).update(updates);
      const updatedDoc = await usersRef.doc(userId).get();
      userDoc = updatedDoc;
    }

    const finalUser = { _id: userId, ...userDoc.data() };
    res.json(buildUserResponse(finalUser));
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user._id).get();

    if (userDoc.exists) {
      const user = userDoc.data();
      res.json({
        success: true,
        _id: userDoc.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const userRef = db.collection('users').doc(req.user._id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const updates = {
      updatedAt: new Date()
    };

    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.email !== undefined) updates.email = req.body.email.toLowerCase().trim();
    if (req.body.profilePicture !== undefined) updates.profilePicture = req.body.profilePicture;

    // Check if new email is already taken by another user
    if (req.body.email && req.body.email.toLowerCase().trim() !== userDoc.data().email) {
      const emailCheck = await db.collection('users')
        .where('email', '==', req.body.email.toLowerCase().trim())
        .limit(1)
        .get();
      if (!emailCheck.empty) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email',
        });
      }
    }

    // Update password if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    await userRef.update(updates);
    const updatedDoc = await userRef.get();
    const updatedUser = { _id: userRef.id, ...updatedDoc.data() };

    res.json({
      success: true,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePicture: updatedUser.profilePicture,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  syncFirebaseUser,
  getUserProfile,
  updateUserProfile,
};
