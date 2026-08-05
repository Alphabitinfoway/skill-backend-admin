const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contactController');
const { createContactRules } = require('../validators/contactValidator');
const { validate } = require('../middleware/validate');

router.route('/')
    .post(createContactRules, validate, submitContact);

module.exports = router;
