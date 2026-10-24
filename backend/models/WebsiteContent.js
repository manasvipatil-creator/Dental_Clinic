const mongoose = require('mongoose');

const websiteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    section: { type: String, required: true, trim: true },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    body: { type: String, default: '' },
    image: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    ctaText: { type: String, default: '' },
    ctaLink: { type: String, default: '' },
    items: { type: mongoose.Schema.Types.Mixed, default: [] },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebsiteContent', websiteContentSchema);
