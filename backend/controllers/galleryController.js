const Gallery = require('../models/Gallery');
const path = require('path');
const fs = require('fs');
const { asyncHandler, paginate, successResponse } = require('../utils/helpers');

// Public: GET /api/gallery
const getPublicGallery = asyncHandler(async (req, res) => {
  const gallery = await Gallery.find({ published: true }).sort({ displayOrder: 1 });
  return successResponse(res, gallery);
});

// Admin: GET /api/admin/gallery
const adminGetGallery = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const { skip, limit: lim, page: pg } = paginate(page, limit);
  const [items, total] = await Promise.all([
    Gallery.find().sort({ displayOrder: 1 }).skip(skip).limit(lim),
    Gallery.countDocuments(),
  ]);
  return successResponse(res, { items, total, page: pg, pages: Math.ceil(total / lim) });
});

// Admin: POST /api/admin/gallery
const adminUploadGallery = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
  const imageUrl = `/uploads/${req.file.filename}`;
  const item = await Gallery.create({
    imageUrl,
    title: req.body.title || '',
    alt: req.body.alt || '',
    category: req.body.category || 'general',
    displayOrder: parseInt(req.body.displayOrder) || 0,
    published: req.body.published !== 'false',
  });
  return successResponse(res, item, 'Image uploaded', 201);
});

// Admin: PUT /api/admin/gallery/:id
const adminUpdateGallery = asyncHandler(async (req, res) => {
  const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found' });
  return successResponse(res, item, 'Updated');
});

// Admin: DELETE /api/admin/gallery/:id
const adminDeleteGallery = asyncHandler(async (req, res) => {
  const item = await Gallery.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found' });
  // Remove file from disk if local
  if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '..', item.imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  return successResponse(res, null, 'Deleted');
});

module.exports = { getPublicGallery, adminGetGallery, adminUploadGallery, adminUpdateGallery, adminDeleteGallery };
