const express = require('express');
const router = express.Router();
const {
    getInternships,
    getInternship
} = require('../controllers/internshipController');

router.route('/')
    .get(getInternships);

router.route('/:slug')
    .get(getInternship);

module.exports = router;
