const Testimonial = require('../models/Testimonial');
const { asyncHandler, paginate, successResponse } = require('../utils/helpers');

// Public: GET /api/testimonials — only approved+published
const getPublicTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ approved: true, published: true })
    .sort({ displayOrder: 1 })
    .select('content displayName rating');
  return successResponse(res, testimonials);
});

// Admin: GET /api/admin/testimonials
const adminGetTestimonials = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { skip, limit: lim, page: pg } = paginate(page, limit);
  const [items, total] = await Promise.all([
    Testimonial.find().sort({ createdAt: -1 }).skip(skip).limit(lim),
    Testimonial.countDocuments(),
  ]);
  return successResponse(res, { items, total, page: pg, pages: Math.ceil(total / lim) });
});

// Admin: POST /api/admin/testimonials
const adminCreateTestimonial = asyncHandler(async (req, res) => {
  const t = await Testimonial.create(req.body);
  return successResponse(res, t, 'Created', 201);
});

// Admin: PUT /api/admin/testimonials/:id
const adminUpdateTestimonial = asyncHandler(async (req, res) => {
  const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!t) return res.status(404).json({ success: false, message: 'Not found' });
  return successResponse(res, t, 'Updated');
});

// Admin: DELETE /api/admin/testimonials/:id
const adminDeleteTestimonial = asyncHandler(async (req, res) => {
  const t = await Testimonial.findByIdAndDelete(req.params.id);
  if (!t) return res.status(404).json({ success: false, message: 'Not found' });
  return successResponse(res, null, 'Deleted');
});

module.exports = { getPublicTestimonials, adminGetTestimonials, adminCreateTestimonial, adminUpdateTestimonial, adminDeleteTestimonial };
