const express = require('express');
const router = express.Router();
const { getPublicJobs } = require('../controllers/jobController');

router.get('/', getPublicJobs);

module.exports = router;