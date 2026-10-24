const express = require('express');
const router = express.Router();
const { getPublicDoctors, getPublicDoctor } = require('../controllers/doctorController');

router.get('/', getPublicDoctors);
router.get('/:id', getPublicDoctor);

module.exports = router;
