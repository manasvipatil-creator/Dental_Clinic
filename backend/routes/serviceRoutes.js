const express = require('express');
const router = express.Router();
const { getPublicServices, getPublicServiceBySlug } = require('../controllers/serviceController');

router.get('/', getPublicServices);
router.get('/:slug', getPublicServiceBySlug);

module.exports = router;
