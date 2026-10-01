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
    body('location')
        .optional()
        .isString().withMessage('Location must be text')
        .isLength({ max: 200 }).withMessage('Location cannot be more than 200 characters'),
    body('jobType')
        .optional()
        .isArray({ min: 1 }).withMessage('Select at least one job type'),
    body('jobType.*')
        .isIn(['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance']).withMessage('Invalid job type'),
    body('experience')
        .optional()
        .isString().withMessage('Experience must be text')
        .isLength({ max: 100 }).withMessage('Experience cannot be more than 100 characters'),
    body('description')
        .notEmpty().withMessage('Please add a job description')
        .isString().withMessage('Description must be text')
        .isLength({ max: 5000 }).withMessage('Description cannot be more than 5000 characters'),
    body('responsibilities')
        .optional()
        .isArray().withMessage('Responsibilities must be an array'),
    body('responsibilities.*')
        .isString().withMessage('Each responsibility must be text')
        .isLength({ max: 500 }).withMessage('Each responsibility cannot be more than 500 characters'),
    body('requirements')
        .optional()
        .isArray().withMessage('Requirements must be an array'),
    body('requirements.*')
        .isString().withMessage('Each requirement must be text')
        .isLength({ max: 500 }).withMessage('Each requirement cannot be more than 500 characters'),
    body('skills')
        .optional()
        .isArray().withMessage('Skills must be an array'),
    body('skills.*')
        .isString().withMessage('Each skill must be text')
        .isLength({ max: 100 }).withMessage('Each skill cannot be more than 100 characters'),
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
    body('location')
        .optional()
        .isString().withMessage('Location must be text')
        .isLength({ max: 200 }).withMessage('Location cannot be more than 200 characters'),
    body('jobType')
        .optional()
        .isArray({ min: 1 }).withMessage('Select at least one job type'),
    body('jobType.*')
        .isIn(['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance']).withMessage('Invalid job type'),
    body('experience')
        .optional()
        .isString().withMessage('Experience must be text')
        .isLength({ max: 100 }).withMessage('Experience cannot be more than 100 characters'),
    body('description')
        .optional()
        .notEmpty().withMessage('Description cannot be empty')
        .isString().withMessage('Description must be text')
        .isLength({ max: 5000 }).withMessage('Description cannot be more than 5000 characters'),
    body('responsibilities')
        .optional()
        .isArray().withMessage('Responsibilities must be an array'),
    body('responsibilities.*')
        .isString().withMessage('Each responsibility must be text')
        .isLength({ max: 500 }).withMessage('Each responsibility cannot be more than 500 characters'),
    body('requirements')
        .optional()
        .isArray().withMessage('Requirements must be an array'),
    body('requirements.*')
        .isString().withMessage('Each requirement must be text')
        .isLength({ max: 500 }).withMessage('Each requirement cannot be more than 500 characters'),
    body('skills')
        .optional()
        .isArray().withMessage('Skills must be an array'),
    body('skills.*')
        .isString().withMessage('Each skill must be text')
        .isLength({ max: 100 }).withMessage('Each skill cannot be more than 100 characters'),
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