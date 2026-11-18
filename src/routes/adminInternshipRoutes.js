const express = require('express');
const router = express.Router();
const {
    getAdminInternships,
    getInternshipById,
    createInternship,
    updateInternshipById,
    deleteInternshipById
} = require('../controllers/internshipController');
const { createInternshipRules, updateInternshipRules } = require('../validators/internshipValidator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { imageUpload } = require('../config/cloudinary');
const AppError = require('../utils/AppError');

const parseInternshipPayload = (req, res, next) => {
    if (typeof req.body.payload !== 'string') {
        return next();
    }

    try {
        const payload = JSON.parse(req.body.payload);
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            throw new Error('Internship payload must be an object');
        }
        req.body = payload;
        next();
    } catch (error) {
        next(new AppError('Invalid internship payload', 400));
    }
};

router.use(protect);

router.route('/')
    .get(getAdminInternships)
    .post(imageUpload.single('image'), parseInternshipPayload, createInternshipRules, validate, createInternship);

router.route('/:id')
    .get(getInternshipById)
    .put(imageUpload.single('image'), parseInternshipPayload, updateInternshipRules, validate, updateInternshipById)
    .delete(deleteInternshipById);

module.exports = router;
