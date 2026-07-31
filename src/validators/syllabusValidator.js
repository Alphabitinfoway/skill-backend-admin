const { body } = require('express-validator');

const createSyllabusRules = [
    body('skillSlug')
        .notEmpty().withMessage('Please specify target skill slug')
        .isString().withMessage('Skill slug must be text')
        .trim(),

    body('pdfUrl')
        .optional()
        .isString().withMessage('PDF URL must be text')
        .trim(),

    body('title')
        .optional()
        .isString().withMessage('Title must be text')
        .trim()
];

const updateSyllabusRules = [
    body('skillSlug')
        .optional()
        .notEmpty().withMessage('Skill slug cannot be empty')
        .isString().withMessage('Skill slug must be text')
        .trim(),

    body('pdfUrl')
        .optional()
        .isString().withMessage('PDF URL must be text')
        .trim(),

    body('title')
        .optional()
        .isString().withMessage('Title must be text')
        .trim()
];

module.exports = {
    createSyllabusRules,
    updateSyllabusRules
};
