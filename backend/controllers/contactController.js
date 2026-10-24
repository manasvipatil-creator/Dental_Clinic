const ContactInquiry = require('../models/ContactInquiry');
const { asyncHandler, paginate, successResponse } = require('../utils/helpers');

// Public: POST /api/contact
const submitInquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const inquiry = await ContactInquiry.create({
    name,
    email: email || '',
    phone: phone || '',
    subject: subject || '',
    message,
    ipAddress: req.ip || '',
  });
  return successResponse(res, { id: inquiry._id }, 'Inquiry submitted successfully', 201);
});

// Admin: GET /api/admin/inquiries
const adminGetInquiries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status = '', search = '' } = req.query;
  const { skip, limit: lim, page: pg } = paginate(page, limit);
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
    ];
  }
  const [items, total] = await Promise.all([
    ContactInquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim),
    ContactInquiry.countDocuments(filter),
  ]);
  return successResponse(res, { items, total, page: pg, pages: Math.ceil(total / lim) });
});

// Admin: GET /api/admin/inquiries/:id
const adminGetInquiry = asyncHandler(async (req, res) => {
  const inquiry = await ContactInquiry.findById(req.params.id);
  if (!inquiry) return res.status(404).json({ success: false, message: 'Not found' });
  return successResponse(res, inquiry);
});

// Admin: PUT /api/admin/inquiries/:id
const adminUpdateInquiry = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  const inquiry = await ContactInquiry.findByIdAndUpdate(
    req.params.id,
    { status, adminNote },
    { new: true, runValidators: true }
  );
  if (!inquiry) return res.status(404).json({ success: false, message: 'Not found' });
  return successResponse(res, inquiry, 'Updated');
});

// Admin: DELETE /api/admin/inquiries/:id
const adminDeleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await ContactInquiry.findByIdAndDelete(req.params.id);
  if (!inquiry) return res.status(404).json({ success: false, message: 'Not found' });
  return successResponse(res, null, 'Deleted');
});

module.exports = { submitInquiry, adminGetInquiries, adminGetInquiry, adminUpdateInquiry, adminDeleteInquiry };
