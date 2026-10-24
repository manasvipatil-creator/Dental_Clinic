const Doctor = require('../models/Doctor');
const { asyncHandler, paginate, successResponse } = require('../utils/helpers');

// Public: GET /api/doctors
const getPublicDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({ active: true })
    .sort({ displayOrder: 1 })
    .select('name qualifications specialization experience biography image imageAlt displayOrder');
  return successResponse(res, doctors);
});

// Public: GET /api/doctors/:id
const getPublicDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ _id: req.params.id, active: true })
    .select('name qualifications specialization experience biography image imageAlt schedule displayOrder');
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  return successResponse(res, doctor);
});

// Admin: GET /api/admin/doctors
const adminGetDoctors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const { skip, limit: lim, page: pg } = paginate(page, limit);
  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  const [doctors, total] = await Promise.all([
    Doctor.find(filter).sort({ displayOrder: 1 }).skip(skip).limit(lim),
    Doctor.countDocuments(filter),
  ]);
  return successResponse(res, { doctors, total, page: pg, pages: Math.ceil(total / lim) });
});

// Admin: GET /api/admin/doctors/:id
const adminGetDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  return successResponse(res, doctor);
});

// Admin: POST /api/admin/doctors
const adminCreateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.create(req.body);
  return successResponse(res, doctor, 'Doctor created', 201);
});

// Admin: PUT /api/admin/doctors/:id
const adminUpdateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  return successResponse(res, doctor, 'Doctor updated');
});

// Admin: DELETE /api/admin/doctors/:id
const adminDeleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  return successResponse(res, null, 'Doctor deleted');
});

module.exports = {
  getPublicDoctors,
  getPublicDoctor,
  adminGetDoctors,
  adminGetDoctor,
  adminCreateDoctor,
  adminUpdateDoctor,
  adminDeleteDoctor,
};
