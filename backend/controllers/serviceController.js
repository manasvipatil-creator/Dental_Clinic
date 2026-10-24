const Service = require('../models/Service');
const slugify = require('slugify');
const { asyncHandler, paginate, successResponse } = require('../utils/helpers');

// Public: GET /api/services
const getPublicServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ published: true })
    .sort({ displayOrder: 1, createdAt: -1 })
    .select('-seoTitle -seoDescription');
  return successResponse(res, services);
});

// Public: GET /api/services/:slug
const getPublicServiceBySlug = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug, published: true });
  if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
  return successResponse(res, service);
});

// Admin: GET /api/admin/services
const adminGetServices = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const { skip, limit: lim, page: pg } = paginate(page, limit);
  const filter = {};
  if (search) filter.title = { $regex: search, $options: 'i' };
  const [services, total] = await Promise.all([
    Service.find(filter).sort({ displayOrder: 1 }).skip(skip).limit(lim),
    Service.countDocuments(filter),
  ]);
  return successResponse(res, { services, total, page: pg, pages: Math.ceil(total / lim) });
});

// Admin: GET /api/admin/services/:id
const adminGetService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
  return successResponse(res, service);
});

// Admin: POST /api/admin/services
const adminCreateService = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const slug = slugify(title, { lower: true, strict: true });
  const service = await Service.create({ ...req.body, slug });
  return successResponse(res, service, 'Service created', 201);
});

// Admin: PUT /api/admin/services/:id
const adminUpdateService = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (updates.title) updates.slug = slugify(updates.title, { lower: true, strict: true });
  const service = await Service.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
  return successResponse(res, service, 'Service updated');
});

// Admin: DELETE /api/admin/services/:id
const adminDeleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
  return successResponse(res, null, 'Service deleted');
});

module.exports = {
  getPublicServices,
  getPublicServiceBySlug,
  adminGetServices,
  adminGetService,
  adminCreateService,
  adminUpdateService,
  adminDeleteService,
};
