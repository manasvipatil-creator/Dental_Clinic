const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true },
    displayName: { type: String, default: 'Anonymous', trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    approved: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

testimonialSchema.index({ published: 1, displayOrder: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
