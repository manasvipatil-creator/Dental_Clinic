const mongoose = require('mongoose');

const workingHourSchema = new mongoose.Schema({
  day: { type: String, required: true },
  open: { type: String, default: '09:00' },
  close: { type: String, default: '17:00' },
  closed: { type: Boolean, default: false },
}, { _id: false });

const clinicSettingsSchema = new mongoose.Schema(
  {
    clinicName: { type: String, default: 'SmileCraft Dental Clinic', trim: true },
    tagline: { type: String, default: '', trim: true },
    logoUrl: { type: String, default: '' },
    phone: { type: String, default: '', trim: true },
    altPhone: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    pincode: { type: String, default: '', trim: true },
    mapEmbedUrl: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    workingHours: { type: [workingHourSchema], default: [] },
    slotDurationMinutes: { type: Number, default: 30 },
    maxAdvanceBookingDays: { type: Number, default: 30 },
    minAdvanceBookingHours: { type: Number, default: 1 },
    socialFacebook: { type: String, default: '' },
    socialInstagram: { type: String, default: '' },
    socialTwitter: { type: String, default: '' },
    socialYoutube: { type: String, default: '' },
    footerText: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClinicSettings', clinicSettingsSchema);
