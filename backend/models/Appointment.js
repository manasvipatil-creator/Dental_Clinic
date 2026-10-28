const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  note: { type: String, default: '' },
}, { _id: false });

const appointmentSchema = new mongoose.Schema(
  {
    referenceNumber: { type: String, unique: true, default: () => `SC-${Date.now().toString(36).toUpperCase()}-${uuidv4().split('-')[0].toUpperCase()}` },
    patientName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, default: '', trim: true, lowercase: true },
    age: { type: Number, default: null },
    gender: { type: String, default: '', trim: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
    appointmentDate: { type: String, required: true }, // "YYYY-MM-DD"
    appointmentTime: { type: String, required: true }, // "HH:MM"
    appointmentEnd: { type: String, required: true },  // "HH:MM"
    message: { type: String, default: '' },
    notes: { type: String, default: '' },
    consentGiven: { type: Boolean, required: true, default: false },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    adminNote: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

appointmentSchema.pre('save', function () {
  if (!this.phone && this.mobile) this.phone = this.mobile;
  if (!this.mobile && this.phone) this.mobile = this.phone;
  if (!this.notes && this.message) this.notes = this.message;
  if (!this.message && this.notes) this.message = this.notes;
});

appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1, doctor: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
