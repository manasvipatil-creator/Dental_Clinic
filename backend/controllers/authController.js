const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken, asyncHandler, successResponse } = require('../utils/helpers');

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.active) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const match = await user.matchPassword(password);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  user.lastLogin = new Date();
  await user.save();
  const token = generateToken(user._id);
  return successResponse(res, { token, user }, 'Login successful');
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, req.user);
});

// PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (email) user.email = email.toLowerCase();
  if (password && password.length >= 8) {
    user.passwordHash = await bcrypt.hash(password, 12);
  }
  await user.save();
  return successResponse(res, user, 'Profile updated');
});

module.exports = { login, getMe, updateProfile };
