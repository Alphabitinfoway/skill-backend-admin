const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is healthy' });
});

// Mount user routes
router.use('/users', userRoutes);

// Mount upload routes
const uploadRoutes = require('./uploadRoutes');
router.use('/upload', uploadRoutes);

// Mount public blog routes
const blogRoutes = require('./blogRoutes');
router.use('/blogs', blogRoutes);

// Mount admin blog routes
const adminBlogRoutes = require('./adminBlogRoutes');
router.use('/admin/blogs', adminBlogRoutes);

// Mount public inquiry routes
const inquiryRoutes = require('./inquiryRoutes');
router.use('/inquiries', inquiryRoutes);
// Mount public meeting routes
const meetingRoutes = require('./meetingRoutes');
router.use('/meetings', meetingRoutes);

// Mount admin meeting routes
const adminMeetingRoutes = require('./adminMeetingRoutes');
router.use('/admin/meetings', adminMeetingRoutes);

// Mount public seminar routes
const seminarRegistrationRoutes = require('./seminarRegistrationRoutes');
router.use('/seminars', seminarRegistrationRoutes);

const seminarEventRoutes = require('./seminarEventRoutes');
router.use('/seminars', seminarEventRoutes);

// Mount admin seminar routes
const adminSeminarRoutes = require('./adminSeminarRoutes');
router.use('/admin/seminars', adminSeminarRoutes);

const adminSeminarEventRoutes = require('./adminSeminarEventRoutes');
router.use('/admin/seminar-events', adminSeminarEventRoutes);

// Mount public syllabus routes
const syllabusRoutes = require('./syllabusRoutes');
router.use('/syllabus', syllabusRoutes);

// Mount admin syllabus routes
const adminSyllabusRoutes = require('./adminSyllabusRoutes');
router.use('/admin/syllabus', adminSyllabusRoutes);

// Mount contact routes
const contactRoutes = require('./contactRoutes');
router.use('/contacts', contactRoutes);

// Mount admin contact routes
const adminContactRoutes = require('./adminContactRoutes');
router.use('/admin/contacts', adminContactRoutes);

module.exports = router;
