const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { submitInquiry } = require('../controllers/contactController');

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many inquiries. Try again later.' },
});

router.post('/', contactLimiter, submitInquiry);

module.exports = router;
