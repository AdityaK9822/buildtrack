const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation.middleware');
const { registerSchema, loginSchema } = require('../utils/validators');
const authenticate = require('../middleware/auth.middleware');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/firebase-login', authController.firebaseLogin);
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateMe);
router.post('/fcm-token', authenticate, authController.registerFCMToken);

module.exports = router;
