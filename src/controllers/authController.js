const User = require('../models/User');
const { generateToken } = require('../utils/jwt.util');
const { getFirebaseAdmin } = require('../config/firebase');

const register = async (req, res) => {
  try {
    const { email, password, name, role, phone, company, firebaseUid } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const userData = {
      email,
      name,
      role,
      phone,
      company,
    };

    // If coming from Firebase Auth (no password)
    if (firebaseUid && !password) {
      userData.firebaseUid = firebaseUid;
    } else if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required for email/password registration',
      });
    } else {
      userData.password = password;
    }

    user = await User.create(userData);

    // Generate JWT token
    const token = generateToken(user._id, user.email, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.email, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
    });
  }
};

const firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    const admin = getFirebaseAdmin();
    if (!admin) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service unavailable',
      });
    }

    // Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken);

    // Find or create user
    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      // Auto-create user if doesn't exist
      user = await User.create({
        email: decoded.email,
        name: decoded.name || 'User',
        firebaseUid: decoded.uid,
        role: 'contractor', // Default role
        avatar: decoded.picture,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Generate custom JWT
    const token = generateToken(user._id, user.email, user.role);

    res.json({
      success: true,
      message: 'Firebase login successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Firebase login error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid Firebase token',
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -fcmTokens');

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
    });
  }
};

const updateMe = async (req, res) => {
  try {
    const { name, phone, company, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, company, avatar },
      { new: true, runValidators: true }
    ).select('-password -fcmTokens');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
    });
  }
};

const registerFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const fcmService = require('../services/fcm.service');

    await fcmService.registerToken(req.user._id, fcmToken);

    res.json({
      success: true,
      message: 'FCM token registered successfully',
    });
  } catch (error) {
    console.error('FCM registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error registering FCM token',
    });
  }
};

module.exports = {
  register,
  login,
  firebaseLogin,
  getMe,
  updateMe,
  registerFCMToken,
};
