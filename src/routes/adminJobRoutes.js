const express = require('express');
const router = express.Router();
const {
    getJobs,
    getJobById,
    createJob,
    updateJob,
    updateJobStatus,
    deleteJob
} = require('../controllers/jobController');
const { createJobRules, updateJobRules, updateJobStatusRules } = require('../validators/jobValidator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getJobs)
    .post(createJobRules, validate, createJob);

router.patch('/:id/status', updateJobStatusRules, validate, updateJobStatus);

router.route('/:id')
    .get(getJobById)
    .put(updateJobRules, validate, updateJob)
    .delete(deleteJob);

module.exports = router;