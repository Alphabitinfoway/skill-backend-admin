const { body } = require('express-validator');

const createApplicationRules = [
    body('jobId')
        .isMongoId().withMessage('Please provide a valid job'),
    body('name')
        .trim()
        .notEmpty().withMessage('Please add your name')
        .isLength({ max: 120 }).withMessage('Name cannot be more than 120 characters'),
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .isLength({ max: 254 }).withMessage('Email cannot be more than 254 characters'),
    body('phone')
        .trim()
        .notEmpty().withMessage('Please add your phone number')
        .isLength({ min: 7, max: 30 }).withMessage('Phone number must be between 7 and 30 characters'),
    body('coverLetter')
        .optional()
        .isLength({ max: 5000 }).withMessage('Cover letter cannot be more than 5000 characters')
];

const updateApplicationStatusRules = [
    body('status')
        .isIn(['submitted', 'reviewing', 'shortlisted', 'rejected', 'hired'])
        .withMessage('Invalid application status')
];

module.exports = { createApplicationRules, updateApplicationStatusRules };