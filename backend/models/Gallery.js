const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    title: { type: String, default: '', trim: true },
    alt: { type: String, default: '', trim: true },
    category: { type: String, default: 'general', trim: true },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

gallerySchema.index({ published: 1, displayOrder: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);
