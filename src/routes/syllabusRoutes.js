const express = require('express');
const router = express.Router();
const {
    getSyllabus,
    getSyllabusBySlug,
    getSyllabusById
} = require('../controllers/syllabusController');

router.route('/')
    .get(getSyllabus);

router.route('/slug/:slug')
    .get(getSyllabusBySlug);

router.route('/:id')
    .get(getSyllabusById);

module.exports = router;
