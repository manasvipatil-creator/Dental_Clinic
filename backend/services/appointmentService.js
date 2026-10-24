/**
 * Appointment slot availability service
 * Handles concurrency-safe slot checking
 */
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const ClinicSettings = require('../models/ClinicSettings');

const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

/**
 * Generate time slots between start and end given duration in minutes
 */
const generateSlots = (startTime, endTime, durationMinutes) => {
  const slots = [];
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const toTime = (mins) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };
  let current = toMinutes(startTime);
  const end = toMinutes(endTime);
  while (current + durationMinutes <= end) {
    slots.push({ start: toTime(current), end: toTime(current + durationMinutes) });
    current += durationMinutes;
  }
  return slots;
};

/**
 * Get available slots for a given date, doctor, and service
 */
const getAvailableSlots = async (dateStr, doctorId, excludeAppointmentId = null) => {
  const settings = await ClinicSettings.findOne().lean();
  if (!settings) return { slots: [], message: 'Clinic settings not configured' };

  const slotDuration = settings.slotDurationMinutes || 30;
  const dayOfWeek = DAYS[new Date(dateStr + 'T00:00:00').getDay()];

  let workStart, workEnd;

  if (doctorId) {
    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor || !doctor.active) return { slots: [], message: 'Doctor not available' };

    // Check blocked periods
    if (doctor.blockedPeriods && doctor.blockedPeriods.some((b) => b.date === dateStr)) {
      return { slots: [], message: 'Doctor is not available on this date' };
    }

    const daySchedule = doctor.schedule?.find((s) => s.day === dayOfWeek && s.available);
    if (!daySchedule) return { slots: [], message: 'Doctor not available on this day' };
    workStart = daySchedule.startTime;
    workEnd = daySchedule.endTime;
  } else {
    // Use clinic working hours
    const dayHours = settings.workingHours?.find((w) => w.day.toLowerCase() === dayOfWeek && !w.closed);
    if (!dayHours) return { slots: [], message: 'Clinic is closed on this day' };
    workStart = dayHours.open;
    workEnd = dayHours.close;
  }

  const allSlots = generateSlots(workStart, workEnd, slotDuration);

  // Get existing appointments for this date+doctor
  const query = {
    appointmentDate: dateStr,
    status: { $in: ['pending', 'confirmed'] },
  };
  if (doctorId) query.doctor = doctorId;
  if (excludeAppointmentId) query._id = { $ne: excludeAppointmentId };

  const existingAppts = await Appointment.find(query).select('appointmentTime appointmentEnd').lean();
  const bookedTimes = existingAppts.map((a) => a.appointmentTime);

  const available = allSlots.filter((s) => !bookedTimes.includes(s.start));
  return { slots: available, message: available.length === 0 ? 'No slots available' : null };
};

/**
 * Check if a specific slot is available (for concurrency safety)
 */
const isSlotAvailable = async (dateStr, timeStr, doctorId, excludeAppointmentId = null) => {
  const query = {
    appointmentDate: dateStr,
    appointmentTime: timeStr,
    status: { $in: ['pending', 'confirmed'] },
  };
  if (doctorId) query.doctor = doctorId;
  if (excludeAppointmentId) query._id = { $ne: excludeAppointmentId };

  const conflict = await Appointment.findOne(query);
  return !conflict;
};

module.exports = { getAvailableSlots, isSlotAvailable, generateSlots };
