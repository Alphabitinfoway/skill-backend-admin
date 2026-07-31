const { body } = require('express-validator');

const createMeetingRules = [
    body('title')
        .notEmpty().withMessage('Please add a title')
        .isString().withMessage('Title must be text')
        .isLength({ max: 100 }).withMessage('Title cannot be more than 100 characters')
        .trim(),
        
    body('subtitle')
        .notEmpty().withMessage('Please add a subtitle')
        .isString().withMessage('Subtitle must be text')
        .isLength({ max: 200 }).withMessage('Subtitle cannot be more than 200 characters')
        .trim(),

    body('videoUrl')
        .optional()
        .isString().withMessage('Video URL must be text')
        .trim(),

    body('skillSlug')
        .optional()
        .isString().withMessage('Skill slug must be text')
        .trim()
];

const updateMeetingRules = [
    body('title')
        .optional()
        .notEmpty().withMessage('Title cannot be empty')
        .isString().withMessage('Title must be text')
        .isLength({ max: 100 }).withMessage('Title cannot be more than 100 characters')
        .trim(),
        
    body('subtitle')
        .optional()
        .notEmpty().withMessage('Subtitle cannot be empty')
        .isString().withMessage('Subtitle must be text')
        .isLength({ max: 200 }).withMessage('Subtitle cannot be more than 200 characters')
        .trim(),

    body('videoUrl')
        .optional()
        .isString().withMessage('Video URL must be text')
        .trim(),

    body('skillSlug')
        .optional()
        .isString().withMessage('Skill slug must be text')
        .trim()
];

module.exports = {
    createMeetingRules,
    updateMeetingRules
};
