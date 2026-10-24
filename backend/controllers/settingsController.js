const ClinicSettings = require('../models/ClinicSettings');
const WebsiteContent = require('../models/WebsiteContent');
const { asyncHandler, successResponse } = require('../utils/helpers');

// Public + Admin: GET /api/settings
const getSettings = asyncHandler(async (req, res) => {
  let settings = await ClinicSettings.findOne().lean();
  if (!settings) settings = {};
  return successResponse(res, settings);
});

// Admin: PUT /api/admin/settings
const adminUpdateSettings = asyncHandler(async (req, res) => {
  let settings = await ClinicSettings.findOne();
  if (!settings) {
    settings = await ClinicSettings.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }
  return successResponse(res, settings, 'Settings updated');
});

// Public: GET /api/content/:key
const getContent = asyncHandler(async (req, res) => {
  const content = await WebsiteContent.findOne({ key: req.params.key, published: true }).lean();
  if (!content) return res.status(404).json({ success: false, message: 'Content not found' });
  return successResponse(res, content);
});

// Public: GET /api/content (all published by section)
const getAllContent = asyncHandler(async (req, res) => {
  const { section } = req.query;
  const filter = { published: true };
  if (section) filter.section = section;
  const contents = await WebsiteContent.find(filter).lean();
  return successResponse(res, contents);
});

// Admin: GET /api/admin/content
const adminGetAllContent = asyncHandler(async (req, res) => {
  const { section } = req.query;
  const filter = {};
  if (section) filter.section = section;
  const contents = await WebsiteContent.find(filter).sort({ section: 1, key: 1 }).lean();
  return successResponse(res, contents);
});

// Admin: PUT /api/admin/content/:key (upsert)
const adminUpsertContent = asyncHandler(async (req, res) => {
  const content = await WebsiteContent.findOneAndUpdate(
    { key: req.params.key },
    { ...req.body, key: req.params.key },
    { new: true, upsert: true, runValidators: true }
  );
  return successResponse(res, content, 'Content saved');
});

// Admin: DELETE /api/admin/content/:id
const adminDeleteContent = asyncHandler(async (req, res) => {
  const c = await WebsiteContent.findByIdAndDelete(req.params.id);
  if (!c) return res.status(404).json({ success: false, message: 'Not found' });
  return successResponse(res, null, 'Deleted');
});

module.exports = { getSettings, adminUpdateSettings, getContent, getAllContent, adminGetAllContent, adminUpsertContent, adminDeleteContent };
