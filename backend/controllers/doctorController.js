const Doctor = require('../models/Doctor');
const { asyncHandler, paginate, successResponse } = require('../utils/helpers');
const { uploadToStorage } = require('../utils/storage');

// Public: GET /api/doctors
const getPublicDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({ active: true })
    .sort({ displayOrder: 1, createdAt: 1 })
    .select('name qualifications specialization experience biography image imageAlt displayOrder consultationFee email phone');
  return successResponse(res, doctors);
});

// Public: GET /api/doctors/:id
const getPublicDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ _id: req.params.id, active: true })
    .select('name qualifications specialization experience biography image imageAlt schedule displayOrder consultationFee email phone');
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
    Doctor.find(filter).sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(lim),
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
  const { name, specialization, qualification, qualifications, bio, biography, experience, email, phone, consultationFee, active, isActive } = req.body;

  // Backend Validation
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Doctor full name is required' });
  }
  if (!specialization || !specialization.trim()) {
    return res.status(400).json({ success: false, message: 'Doctor specialization is required' });
  }

  // Handle uploaded image if multipart form was sent
  let imageUrl = req.body.image || '';
  if (req.file) {
    imageUrl = await uploadToStorage(req.file, 'doctors');
  }

  // Currency formatting for consultation fee
  let formattedFee = consultationFee ? String(consultationFee).trim() : '';
  if (formattedFee.includes('$')) {
    formattedFee = formattedFee.replace(/\$/g, '₹');
  }

  const doctorData = {
    name: name.trim(),
    specialization: specialization.trim(),
    qualifications: (qualifications || qualification || '').trim(),
    biography: (biography || bio || '').trim(),
    experience: experience !== undefined ? String(experience).trim() : '',
    email: (email || '').trim().toLowerCase(),
    phone: (phone || '').trim(),
    consultationFee: formattedFee,
    image: imageUrl,
    imageAlt: req.body.imageAlt || `Dr. ${name.trim()}`,
    active: active !== undefined ? (active === true || active === 'true') : (isActive !== undefined ? (isActive === true || isActive === 'true') : true),
    displayOrder: Number(req.body.displayOrder) || 0,
  };

  const doctor = await Doctor.create(doctorData);
  return successResponse(res, doctor, 'Doctor created successfully', 201);
});

// Admin: PUT /api/admin/doctors/:id
const adminUpdateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

  const { name, specialization, qualification, qualifications, bio, biography, experience, email, phone, consultationFee, active, isActive } = req.body;

  // Validation if fields are updated
  if (name !== undefined && !name.trim()) {
    return res.status(400).json({ success: false, message: 'Doctor full name cannot be empty' });
  }
  if (specialization !== undefined && !specialization.trim()) {
    return res.status(400).json({ success: false, message: 'Doctor specialization cannot be empty' });
  }

  // Handle image upload
  let imageUrl = doctor.image;
  if (req.file) {
    imageUrl = await uploadToStorage(req.file, 'doctors');
  } else if (req.body.image !== undefined) {
    imageUrl = req.body.image;
  }

  // Currency formatting for consultation fee
  let formattedFee = doctor.consultationFee;
  if (consultationFee !== undefined) {
    formattedFee = String(consultationFee).trim();
    if (formattedFee.includes('$')) {
      formattedFee = formattedFee.replace(/\$/g, '₹');
    }
  }

  const updates = {
    ...(name !== undefined && { name: name.trim() }),
    ...(specialization !== undefined && { specialization: specialization.trim() }),
    ...((qualifications !== undefined || qualification !== undefined) && { qualifications: (qualifications ?? qualification).trim() }),
    ...((biography !== undefined || bio !== undefined) && { biography: (biography ?? bio).trim() }),
    ...(experience !== undefined && { experience: String(experience).trim() }),
    ...(email !== undefined && { email: email.trim().toLowerCase() }),
    ...(phone !== undefined && { phone: phone.trim() }),
    ...(consultationFee !== undefined && { consultationFee: formattedFee }),
    image: imageUrl,
    ...(req.body.imageAlt !== undefined && { imageAlt: req.body.imageAlt }),
    ...((active !== undefined || isActive !== undefined) && {
      active: active !== undefined ? (active === true || active === 'true') : (isActive === true || isActive === 'true'),
    }),
    ...(req.body.displayOrder !== undefined && { displayOrder: Number(req.body.displayOrder) || 0 }),
  };

  const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  return successResponse(res, updatedDoctor, 'Doctor updated successfully');
});

// Admin: DELETE /api/admin/doctors/:id
const adminDeleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  return successResponse(res, null, 'Doctor deleted successfully');
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
