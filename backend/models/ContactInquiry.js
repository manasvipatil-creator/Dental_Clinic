const mongoose = require('mongoose');

const contactInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
    subject: { type: String, default: '', trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new' },
    adminNote: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

contactInquirySchema.index({ status: 1 });
contactInquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('ContactInquiry', contactInquirySchema);
