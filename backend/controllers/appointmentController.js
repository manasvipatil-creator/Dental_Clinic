const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const ClinicSettings = require('../models/ClinicSettings');
const { getAvailableSlots, isSlotAvailable } = require('../services/appointmentService');
const { asyncHandler, paginate, successResponse } = require('../utils/helpers');

// Public: GET /api/appointments/slots
const getSlots = asyncHandler(async (req, res) => {
  const { date, doctorId } = req.query;
  if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

  // Reject past dates
  const today = new Date().toISOString().split('T')[0];
  if (date < today) return res.status(400).json({ success: false, message: 'Cannot book past dates' });

  const settings = await ClinicSettings.findOne().lean();
  if (settings) {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + (settings.maxAdvanceBookingDays || 30));
    if (date > maxDate.toISOString().split('T')[0]) {
      return res.status(400).json({ success: false, message: 'Date is too far in the future' });
    }
  }

  const result = await getAvailableSlots(date, doctorId || null);
  return successResponse(res, result);
});

// Public: POST /api/appointments
const createAppointment = asyncHandler(async (req, res) => {
  const patientName = req.body.patientName?.trim();
  const mobile = (req.body.mobile || req.body.phone)?.trim();
  const email = (req.body.email || '')?.trim();
  const serviceId = req.body.serviceId || req.body.service;
  const doctorId = req.body.doctorId || req.body.doctor || null;
  const appointmentDate = req.body.appointmentDate;
  let appointmentTime = req.body.appointmentTime;
  const message = req.body.message || req.body.notes || '';
  const consentGiven = req.body.consentGiven === true || req.body.consentGiven === 'true';

  if (!patientName) {
    return res.status(400).json({ success: false, message: 'Patient name is required' });
  }

  if (!mobile) {
    return res.status(400).json({ success: false, message: 'Mobile phone number is required' });
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
  }

  if (!serviceId) {
    return res.status(400).json({ success: false, message: 'Please select a dental service' });
  }

  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Selected dental service not found' });
  }

  if (!appointmentDate || !appointmentTime) {
    return res.status(400).json({ success: false, message: 'Appointment date and time slot are required' });
  }

  // Normalize appointment time (convert 12h format like '09:30 AM' to 24h '09:30')
  if (/am|pm/i.test(appointmentTime)) {
    const match = appointmentTime.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const modifier = match[3].toLowerCase();
      if (modifier === 'pm' && hours < 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;
      appointmentTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
  }

  // Reject past dates
  const today = new Date().toISOString().split('T')[0];
  if (appointmentDate < today) {
    return res.status(400).json({ success: false, message: 'Cannot book past dates' });
  }

  if (!consentGiven) {
    return res.status(400).json({ success: false, message: 'Patient consent to clinic privacy policy is required' });
  }

  // Re-validate slot availability (concurrency-safe)
  const available = await isSlotAvailable(appointmentDate, appointmentTime, doctorId || null);
  if (!available) {
    return res.status(409).json({ success: false, message: 'This time slot is no longer available. Please select another.' });
  }

  // Calculate end time based on slot duration
  const settings = await ClinicSettings.findOne().lean();
  const duration = settings?.slotDurationMinutes || 30;
  const [h, m] = appointmentTime.split(':').map(Number);
  const safeH = isNaN(h) ? 9 : h;
  const safeM = isNaN(m) ? 0 : m;
  const endMinutes = safeH * 60 + safeM + duration;
  const appointmentEnd = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

  const appointment = await Appointment.create({
    patientName,
    mobile,
    email: email || '',
    service: serviceId,
    doctor: doctorId || null,
    appointmentDate,
    appointmentTime,
    appointmentEnd,
    message: message || '',
    consentGiven: true,
    status: 'pending',
    statusHistory: [{ status: 'pending', note: 'Appointment created' }],
  });

  const populated = await Appointment.findById(appointment._id)
    .populate('service', 'title')
    .populate('doctor', 'name');

  return successResponse(res, {
    referenceNumber: populated.referenceNumber,
    appointmentDate: populated.appointmentDate,
    appointmentTime: populated.appointmentTime,
    service: populated.service?.title,
    doctor: populated.doctor?.name,
    status: populated.status,
  }, 'Appointment booked successfully', 201);
});

// Admin: GET /api/admin/appointments
const adminGetAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', status = '', date = '', doctorId = '' } = req.query;
  const { skip, limit: lim, page: pg } = paginate(page, limit);
  const filter = {};
  if (status) filter.status = status;
  if (date) filter.appointmentDate = date;
  if (doctorId) filter.doctor = doctorId;
  if (search) {
    filter.$or = [
      { patientName: { $regex: search, $options: 'i' } },
      { referenceNumber: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
    ];
  }
  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('service', 'title')
      .populate('doctor', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim),
    Appointment.countDocuments(filter),
  ]);
  return successResponse(res, { appointments, total, page: pg, pages: Math.ceil(total / lim) });
});

// Admin: GET /api/admin/appointments/:id
const adminGetAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id)
    .populate('service', 'title slug')
    .populate('doctor', 'name qualifications specialization');
  if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
  return successResponse(res, appt);
});

// Admin: PUT /api/admin/appointments/:id/status
const adminUpdateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, note, appointmentDate, appointmentTime } = req.body;
  const appt = await Appointment.findById(req.params.id);
  if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });

  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };
  if (!validTransitions[appt.status].includes(status)) {
    return res.status(400).json({ success: false, message: `Cannot transition from ${appt.status} to ${status}` });
  }

  // Handle rescheduling
  if (appointmentDate && appointmentTime) {
    const today = new Date().toISOString().split('T')[0];
    if (appointmentDate < today) return res.status(400).json({ success: false, message: 'Cannot reschedule to past date' });
    const available = await isSlotAvailable(appointmentDate, appointmentTime, appt.doctor?.toString(), appt._id.toString());
    if (!available) return res.status(409).json({ success: false, message: 'Slot not available' });

    const settings = await ClinicSettings.findOne().lean();
    const duration = settings?.slotDurationMinutes || 30;
    const [h, m] = appointmentTime.split(':').map(Number);
    const endMinutes = h * 60 + m + duration;
    appt.appointmentDate = appointmentDate;
    appt.appointmentTime = appointmentTime;
    appt.appointmentEnd = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;
  }

  appt.status = status;
  if (req.body.adminNote !== undefined) appt.adminNote = req.body.adminNote;
  appt.statusHistory.push({ status, note: note || '' });
  await appt.save();
  return successResponse(res, appt, 'Appointment updated');
});

// Admin dashboard stats
const adminGetStats = asyncHandler(async (req, res) => {
  const Doctor = require('../models/Doctor');
  const Service = require('../models/Service');
  const ContactInquiry = require('../models/ContactInquiry');

  const [
    total,
    pending,
    confirmed,
    completed,
    cancelled,
    doctorsCount,
    servicesCount,
    unreadInquiries,
    recentAppointments,
    recentInquiries,
  ] = await Promise.all([
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.countDocuments({ status: 'confirmed' }),
    Appointment.countDocuments({ status: 'completed' }),
    Appointment.countDocuments({ status: 'cancelled' }),
    Doctor.countDocuments(),
    Service.countDocuments(),
    ContactInquiry.countDocuments({ status: 'unread' }),
    Appointment.find().populate('service', 'title').populate('doctor', 'name').sort({ createdAt: -1 }).limit(5),
    ContactInquiry.find().sort({ createdAt: -1 }).limit(5),
  ]);

  const statsData = {
    appointments: { total, pending, confirmed, completed, cancelled },
    total,
    pending,
    confirmed,
    completed,
    cancelled,
    doctorsCount,
    servicesCount,
    unreadInquiries,
    recentAppointments,
    recentInquiries,
  };

  return successResponse(res, statsData);
});

module.exports = {
  getSlots,
  createAppointment,
  adminGetAppointments,
  adminGetAppointment,
  adminUpdateAppointmentStatus,
  adminGetStats,
};
