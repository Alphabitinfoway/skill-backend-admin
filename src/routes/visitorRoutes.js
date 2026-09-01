const express = require('express');
const router = express.Router();
const {
  recordAndGetVisitorCount,
  getTotalVisitorCount,
} = require('../controllers/visitorController');

// Public route to record visit & get unique count
router.get('/count', recordAndGetVisitorCount);

// Public route to retrieve count without recording a visit
router.get('/total', getTotalVisitorCount);

module.exports = router;
