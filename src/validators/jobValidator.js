const { body } = require('express-validator');

const createJobRules = [
    body('department')
        .notEmpty().withMessage('Please add a department')
        .isString().withMessage('Department must be text')
        .isLength({ max: 120 }).withMessage('Department cannot be more than 120 characters'),
    body('title')
        .notEmpty().withMessage('Please add a job title')
        .isString().withMessage('Job title must be text')
        .isLength({ max: 160 }).withMessage('Job title cannot be more than 160 characters'),
    body('description')
        .notEmpty().withMessage('Please add a job description')
        .isString().withMessage('Description must be text')
        .isLength({ max: 5000 }).withMessage('Description cannot be more than 5000 characters'),
    body('status')
        .optional()
        .isIn(['draft', 'published', 'closed']).withMessage('Invalid job status'),
    body('sortOrder')
        .optional()
        .isInt().withMessage('Sort order must be an integer')
];

const updateJobRules = [
    body('department')
        .optional()
        .notEmpty().withMessage('Department cannot be empty')
        .isString().withMessage('Department must be text')
        .isLength({ max: 120 }).withMessage('Department cannot be more than 120 characters'),
    body('title')
        .optional()
        .notEmpty().withMessage('Job title cannot be empty')
        .isString().withMessage('Job title must be text')
        .isLength({ max: 160 }).withMessage('Job title cannot be more than 160 characters'),
    body('description')
        .optional()
        .notEmpty().withMessage('Description cannot be empty')
        .isString().withMessage('Description must be text')
        .isLength({ max: 5000 }).withMessage('Description cannot be more than 5000 characters'),
    body('status')
        .optional()
        .isIn(['draft', 'published', 'closed']).withMessage('Invalid job status'),
    body('sortOrder')
        .optional()
        .isInt().withMessage('Sort order must be an integer')
];

const updateJobStatusRules = [
    body('status')
        .isIn(['draft', 'published', 'closed']).withMessage('Invalid job status')
];

module.exports = { createJobRules, updateJobRules, updateJobStatusRules };