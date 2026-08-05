const express = require('express');
const router = express.Router();
const {
    getContacts,
    updateContactStatus,
    deleteContact
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(protect);

router.route('/')
    .get(getContacts);

router.route('/:id/status')
    .patch(updateContactStatus);

router.route('/:id')
    .delete(deleteContact);

module.exports = router;
