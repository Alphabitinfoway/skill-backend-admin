const express = require('express');
const router = express.Router();
const { getVisitorStats } = require('../controllers/visitorController');
const { protect } = require('../middleware/authMiddleware');

// Protect all admin visitor routes
router.use(protect);

router.get('/stats', getVisitorStats);

module.exports = router;
