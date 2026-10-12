const { verifyToken } = require('../utils/jwt.util');
const { getFirebaseAdmin } = require('../config/firebase');
const User = require('../models/User');
const { ErrorResponse } = require('../utils/helpers');

const authenticate = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
      });
    }

    // Try JWT verification first
    try {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.userId).select('+password');
        if (!user || !user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'User not found or inactive',
          });
        }
        req.user = user;
        req.authMethod = 'jwt';
        return next();
      }
    } catch (jwtError) {
      // JWT failed, try Firebase ID token
    }

    // Try Firebase ID token verification
    try {
      const admin = getFirebaseAdmin();
      if (admin) {
        const decoded = await admin.auth().verifyIdToken(token);
        const user = await User.findOne({ firebaseUid: decoded.uid }).select('+password');
        
        if (!user || !user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'User not found or inactive',
          });
        }
        
        req.user = user;
        req.authMethod = 'firebase';
        return next();
      }
    } catch (firebaseError) {
      // Firebase auth failed
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token',
    });
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

module.exports = authenticate;
