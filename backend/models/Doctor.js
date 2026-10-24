const mongoose = require('mongoose');

const scheduleSlotSchema = new mongoose.Schema({
  day: { type: String, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], required: true },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "17:00"
  available: { type: Boolean, default: true },
}, { _id: false });

const blockedPeriodSchema = new mongoose.Schema({
  date: { type: String, required: true }, // "YYYY-MM-DD"
  reason: { type: String, default: '' },
}, { _id: false });

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    qualifications: { type: String, trim: true, default: '' },
    specialization: { type: String, trim: true, default: '' },
    experience: { type: String, trim: true, default: '' },
    biography: { type: String, trim: true, default: '' },
    image: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    schedule: { type: [scheduleSlotSchema], default: [] },
    blockedPeriods: { type: [blockedPeriodSchema], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

doctorSchema.index({ active: 1, displayOrder: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
