const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadToStorage } = require('../utils/storage');

const {
  adminGetServices, adminGetService, adminCreateService, adminUpdateService, adminDeleteService,
} = require('../controllers/serviceController');

const {
  adminGetDoctors, adminGetDoctor, adminCreateDoctor, adminUpdateDoctor, adminDeleteDoctor,
} = require('../controllers/doctorController');

const {
  adminGetAppointments, adminGetAppointment, adminUpdateAppointmentStatus, adminDeleteAppointment, adminGetStats,
} = require('../controllers/appointmentController');

const {
  adminGetGallery, adminUploadGallery, adminUpdateGallery, adminDeleteGallery,
} = require('../controllers/galleryController');

const {
  adminGetTestimonials, adminCreateTestimonial, adminUpdateTestimonial, adminDeleteTestimonial,
} = require('../controllers/testimonialController');

const {
  adminGetInquiries, adminGetInquiry, adminUpdateInquiry, adminDeleteInquiry,
} = require('../controllers/contactController');

const {
  adminUpdateSettings, adminGetAllContent, adminUpsertContent, adminDeleteContent,
} = require('../controllers/settingsController');

// All admin routes require authentication
router.use(protect, requireAdmin);

// Dashboard metrics (aliased to prevent adblockers from blocking /stats)
router.get('/stats', adminGetStats);
router.get('/overview', adminGetStats);
router.get('/dashboard-metrics', adminGetStats);

// Services
router.get('/services', adminGetServices);
router.get('/services/:id', adminGetService);
router.post('/services', upload.single('image'), async (req, res, next) => {
  try {
    if (req.file) {
      req.body.image = await uploadToStorage(req.file, 'services');
    }
    adminCreateService(req, res, next);
  } catch (err) { next(err); }
});
router.put('/services/:id', upload.single('image'), async (req, res, next) => {
  try {
    if (req.file) {
      req.body.image = await uploadToStorage(req.file, 'services');
    }
    adminUpdateService(req, res, next);
  } catch (err) { next(err); }
});
router.delete('/services/:id', adminDeleteService);

// Service image upload (dedicated endpoint)
router.post('/services/:id/image', upload.single('image'), async (req, res, next) => {
  try {
    const Service = require('../models/Service');
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    const imageUrl = await uploadToStorage(req.file, 'services');
    const service = await Service.findByIdAndUpdate(req.params.id, { image: imageUrl }, { new: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: { image: imageUrl }, message: 'Image uploaded' });
  } catch (err) { next(err); }
});

// Doctors
router.get('/doctors', adminGetDoctors);
router.get('/doctors/:id', adminGetDoctor);
router.post('/doctors', upload.single('image'), adminCreateDoctor);
router.put('/doctors/:id', upload.single('image'), adminUpdateDoctor);
router.delete('/doctors/:id', adminDeleteDoctor);

// Doctor image upload
router.post('/doctors/:id/image', upload.single('image'), async (req, res, next) => {
  try {
    const Doctor = require('../models/Doctor');
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    const imageUrl = await uploadToStorage(req.file, 'doctors');
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { image: imageUrl }, { new: true });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: { image: imageUrl }, message: 'Doctor image uploaded successfully' });
  } catch (err) { next(err); }
});

// Appointments
router.get('/appointments', adminGetAppointments);
router.get('/appointments/:id', adminGetAppointment);
router.put('/appointments/:id/status', adminUpdateAppointmentStatus);
router.delete('/appointments/:id', adminDeleteAppointment);

// Gallery
router.get('/gallery', adminGetGallery);
router.post('/gallery', upload.single('image'), adminUploadGallery);
router.put('/gallery/:id', upload.single('image'), adminUpdateGallery);
router.delete('/gallery/:id', adminDeleteGallery);

// Testimonials
router.get('/testimonials', adminGetTestimonials);
router.post('/testimonials', adminCreateTestimonial);
router.put('/testimonials/:id', adminUpdateTestimonial);
router.delete('/testimonials/:id', adminDeleteTestimonial);

// Contact inquiries
router.get('/inquiries', adminGetInquiries);
router.get('/inquiries/:id', adminGetInquiry);
router.put('/inquiries/:id', adminUpdateInquiry);
router.delete('/inquiries/:id', adminDeleteInquiry);

// Settings
router.put('/settings', adminUpdateSettings);

// Website content
router.get('/content', adminGetAllContent);
router.put('/content/:key', adminUpsertContent);
router.delete('/content/:id', adminDeleteContent);

// Logo upload
router.post('/settings/logo', upload.single('logo'), async (req, res, next) => {
  try {
    const ClinicSettings = require('../models/ClinicSettings');
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    const logoUrl = await uploadToStorage(req.file, 'logos');
    let settings = await ClinicSettings.findOne();
    if (!settings) settings = await ClinicSettings.create({ logoUrl });
    else { settings.logoUrl = logoUrl; await settings.save(); }
    res.json({ success: true, data: { logoUrl }, message: 'Logo uploaded' });
  } catch (err) { next(err); }
});

module.exports = router;
