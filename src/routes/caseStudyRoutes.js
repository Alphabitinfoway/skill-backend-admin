const express = require('express');
const router = express.Router();
const {
    getCaseStudies,
    getCaseStudy
} = require('../controllers/caseStudyController');

router.route('/')
    .get(getCaseStudies);

router.route('/:slug')
    .get(getCaseStudy);

module.exports = router;