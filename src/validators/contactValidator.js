const { body } = require('express-validator');

const createContactRules = [
    body('firstName')
        .notEmpty().withMessage('First name is required')
        .isString().withMessage('First name must be text')
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name can only contain letters, spaces, and hyphens'),
        
    body('lastName')
        .optional({ checkFalsy: true })
        .isString().withMessage('Last name must be text')
        .trim()
        .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),

    body('email')
        .notEmpty().withMessage('Email address is required')
        .isEmail().withMessage('Please provide a valid email address (e.g. john@example.com)')
        .normalizeEmail(),

    body('contactNumber')
        .notEmpty().withMessage('Contact number is required')
        .trim()
        .matches(/^(\+91[\-\s]?)?[0-9]{10}$|^[0-9+\s\-()]{10,15}$/)
        .withMessage('Please provide a valid 10-digit phone number or international contact number'),

    body('subject')
        .notEmpty().withMessage('Subject is required')
        .isString().withMessage('Subject must be text')
        .trim()
        .isLength({ min: 3, max: 200 }).withMessage('Subject must be between 3 and 200 characters'),

    body('message')
        .notEmpty().withMessage('Message content is required')
        .isString().withMessage('Message must be text')
        .trim()
        .isLength({ min: 10, max: 2000 }).withMessage('Message must be at least 10 characters long')
];

module.exports = {
    createContactRules
};
