const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getSlots, createAppointment } = require('../controllers/appointmentController');

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many booking requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/slots', getSlots);
router.post('/', bookingLimiter, createAppointment);

module.exports = router;
