const express = require('express');
const router = express.Router();
const { getPublicGallery } = require('../controllers/galleryController');
const { getPublicTestimonials } = require('../controllers/testimonialController');
const { getSettings, getAllContent, getContent } = require('../controllers/settingsController');

router.get('/gallery', getPublicGallery);
router.get('/testimonials', getPublicTestimonials);
router.get('/settings', getSettings);
router.get('/content', getAllContent);
router.get('/content/:key', getContent);

module.exports = router;
