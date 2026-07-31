const express = require('express');
const router = express.Router();
const {
    getSyllabus,
    getSyllabusById,
    createSyllabus,
    updateSyllabusById,
    deleteSyllabusById
} = require('../controllers/syllabusController');
const { upload, pdfUpload } = require('../config/cloudinary');
const { createSyllabusRules, updateSyllabusRules } = require('../validators/syllabusValidator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(protect);

const uploadFields = pdfUpload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]);

router.route('/')
    .get(getSyllabus)
    .post(uploadFields, createSyllabusRules, validate, createSyllabus);

router.route('/:id')
    .get(getSyllabusById)
    .put(uploadFields, updateSyllabusRules, validate, updateSyllabusById)
    .delete(deleteSyllabusById);

module.exports = router;
