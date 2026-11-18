const internshipService = require('../services/internshipService');
const catchAsync = require('../middleware/catchAsync');

// @desc    Get published internships
// @route   GET /api/internships
// @access  Public
const getInternships = catchAsync(async (req, res) => {
    const internships = await internshipService.getAllInternships({ publishedOnly: true });
    res.status(200).json({ success: true, count: internships.length, data: internships });
});

// @desc    Get a published internship by slug
// @route   GET /api/internships/:slug
// @access  Public
const getInternship = catchAsync(async (req, res) => {
    const internship = await internshipService.getInternshipBySlug(req.params.slug);
    res.status(200).json({ success: true, data: internship });
});

// @desc    Get all internships for administration
// @route   GET /api/admin/internships
// @access  Private/Admin
const getAdminInternships = catchAsync(async (req, res) => {
    const internships = await internshipService.getAllInternships();
    res.status(200).json({ success: true, count: internships.length, data: internships });
});

// @desc    Get an internship by ID for administration
// @route   GET /api/admin/internships/:id
// @access  Private/Admin
const getInternshipById = catchAsync(async (req, res) => {
    const internship = await internshipService.getInternshipById(req.params.id);
    res.status(200).json({ success: true, data: internship });
});

// @desc    Create an internship
// @route   POST /api/admin/internships
// @access  Private/Admin
const createInternship = catchAsync(async (req, res) => {
    const internship = await internshipService.createInternship(req.body, req.file);
    res.status(201).json({ success: true, data: internship });
});

// @desc    Update an internship by ID
// @route   PUT /api/admin/internships/:id
// @access  Private/Admin
const updateInternshipById = catchAsync(async (req, res) => {
    const internship = await internshipService.updateInternshipById(req.params.id, req.body, req.file);
    res.status(200).json({ success: true, data: internship });
});

// @desc    Delete an internship by ID
// @route   DELETE /api/admin/internships/:id
// @access  Private/Admin
const deleteInternshipById = catchAsync(async (req, res) => {
    await internshipService.deleteInternshipById(req.params.id);
    res.status(200).json({ success: true, data: {} });
});

module.exports = {
    getInternships,
    getInternship,
    getAdminInternships,
    getInternshipById,
    createInternship,
    updateInternshipById,
    deleteInternshipById
};
