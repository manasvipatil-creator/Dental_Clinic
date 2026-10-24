const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { login, getMe, updateProfile } = require('../controllers/authController');
const { protect, requireAdmin } = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, login);
router.get('/me', protect, requireAdmin, getMe);
router.put('/profile', protect, requireAdmin, updateProfile);

module.exports = router;
