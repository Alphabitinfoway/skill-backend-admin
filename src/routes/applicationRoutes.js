const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const { submitApplication } = require('../controllers/applicationController');
const { cloudinary, resumeUpload } = require('../config/cloudinary');
const { createApplicationRules } = require('../validators/applicationValidator');
const { validate } = require('../middleware/validate');
const AppError = require('../utils/AppError');

const uploadResume = (req, res, next) => {
    resumeUpload.single('resume')(req, res, (error) => {
        if (!error) return next();
        if (error.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('Resume cannot be larger than 10 MB', 400));
        }
        next(error);
    });
};

const validateUploadedApplication = async (req, res, next) => {
    if (!validationResult(req).isEmpty() && req.file?.filename) {
        try {
            await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
        } catch (error) {
            console.error('Failed to clean up invalid application resume:', error.message);
        }
    }

    validate(req, res, next);
};

router.post(
    '/',
    uploadResume,
    createApplicationRules,
    validateUploadedApplication,
    submitApplication
);

module.exports = router;