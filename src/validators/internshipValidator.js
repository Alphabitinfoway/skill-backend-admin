const { body } = require('express-validator');

const createInternshipRules = [
    body('title')
        .notEmpty().withMessage('Please add a title')
        .isString().withMessage('Title must be text')
        .isLength({ max: 200 }).withMessage('Title cannot be more than 200 characters'),
    body('slug')
        .notEmpty().withMessage('Please add a slug')
        .isString().withMessage('Slug must be text')
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must contain lowercase letters, numbers, and hyphens only'),
    body('hero')
        .isObject().withMessage('Hero content must be an object'),
    body('hero.subtitle')
        .notEmpty().withMessage('Please add a hero subtitle')
        .isString().withMessage('Hero subtitle must be text'),
    body('curriculum')
        .isArray().withMessage('Curriculum must be an array'),
    body('projects')
        .isArray().withMessage('Projects must be an array'),
    body('faqs')
        .isArray().withMessage('FAQs must be an array')
];

const updateInternshipRules = [
    body('title')
        .optional()
        .notEmpty().withMessage('Title cannot be empty')
        .isString().withMessage('Title must be text')
        .isLength({ max: 200 }).withMessage('Title cannot be more than 200 characters'),
    body('slug')
        .optional()
        .notEmpty().withMessage('Slug cannot be empty')
        .isString().withMessage('Slug must be text')
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must contain lowercase letters, numbers, and hyphens only'),
    body('hero')
        .optional()
        .isObject().withMessage('Hero content must be an object'),
    body('curriculum')
        .optional()
        .isArray().withMessage('Curriculum must be an array'),
    body('projects')
        .optional()
        .isArray().withMessage('Projects must be an array'),
    body('faqs')
        .optional()
        .isArray().withMessage('FAQs must be an array'),
    body('isPublished')
        .optional()
        .isBoolean().withMessage('isPublished must be true or false')
];

module.exports = {
    createInternshipRules,
    updateInternshipRules
};
