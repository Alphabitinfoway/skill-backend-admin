const express = require('express');
const router = express.Router();
const {
    getCaseStudies,
    getCaseStudyById,
    createCaseStudy,
    updateCaseStudyById,
    deleteCaseStudyById
} = require('../controllers/caseStudyController');
const { upload } = require('../config/cloudinary');
const { createCaseStudyRules, updateCaseStudyRules } = require('../validators/caseStudyValidator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getCaseStudies)
    .post(upload.single('image'), createCaseStudyRules, validate, createCaseStudy);

router.route('/:id')
    .get(getCaseStudyById)
    .put(upload.single('image'), updateCaseStudyRules, validate, updateCaseStudyById)
    .delete(deleteCaseStudyById);

module.exports = router;