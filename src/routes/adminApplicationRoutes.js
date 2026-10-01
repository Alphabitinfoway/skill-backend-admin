const express = require('express');
const router = express.Router();
const {
    getApplications,
    getApplicationById,
    getApplicationResume,
    updateApplicationStatus,
    deleteApplication
} = require('../controllers/applicationController');
const { updateApplicationStatusRules } = require('../validators/applicationValidator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getApplications);
router.get('/:id/resume', getApplicationResume);
router.get('/:id', getApplicationById);
router.patch('/:id/status', updateApplicationStatusRules, validate, updateApplicationStatus);
router.delete('/:id', deleteApplication);

module.exports = router;