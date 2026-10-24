const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, trim: true },
    fullDescription: { type: String, trim: true },
    treatmentDetails: { type: String, trim: true },
    image: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    price: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

serviceSchema.index({ published: 1, displayOrder: 1 });

module.exports = mongoose.model('Service', serviceSchema);
