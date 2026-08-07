const { body } = require('express-validator');

const createBlogRules = [
    body('title')
        .notEmpty().withMessage('Please add a title')
        .isString().withMessage('Title must be text')
        .isLength({ max: 200 }).withMessage('Title cannot be more than 200 characters'),
        
    body('content')
        .notEmpty().withMessage('Please add some content')
        .isString().withMessage('Content must be text')
];

const updateBlogRules = [
    body('title')
        .optional()
        .notEmpty().withMessage('Title cannot be empty')
        .isString().withMessage('Title must be text')
        .isLength({ max: 200 }).withMessage('Title cannot be more than 200 characters'),
        
    body('content')
        .optional()
        .notEmpty().withMessage('Content cannot be empty')
        .isString().withMessage('Content must be text'),
        
    body('slug')
        .optional()
        .notEmpty().withMessage('Slug cannot be empty')
        .isString().withMessage('Slug must be text')
];

module.exports = {
    createBlogRules,
    updateBlogRules
};
