const caseStudyService = require('../services/caseStudyService');
const catchAsync = require('../middleware/catchAsync');

const getCaseStudies = catchAsync(async (req, res) => {
    const caseStudies = await caseStudyService.getAllCaseStudies();
    res.status(200).json({ success: true, count: caseStudies.length, data: caseStudies });
});

const getCaseStudy = catchAsync(async (req, res) => {
    const caseStudy = await caseStudyService.getCaseStudyBySlug(req.params.slug);
    res.status(200).json({ success: true, data: caseStudy });
});

const getCaseStudyById = catchAsync(async (req, res) => {
    const caseStudy = await caseStudyService.getCaseStudyById(req.params.id);
    res.status(200).json({ success: true, data: caseStudy });
});

const createCaseStudy = catchAsync(async (req, res) => {
    const caseStudy = await caseStudyService.createCaseStudy(req.body, req.file);
    res.status(201).json({ success: true, data: caseStudy });
});

const updateCaseStudyById = catchAsync(async (req, res) => {
    const caseStudy = await caseStudyService.updateCaseStudyById(req.params.id, req.body, req.file);
    res.status(200).json({ success: true, data: caseStudy });
});

const deleteCaseStudyById = catchAsync(async (req, res) => {
    await caseStudyService.deleteCaseStudyById(req.params.id);
    res.status(200).json({ success: true, data: {} });
});

module.exports = {
    getCaseStudies,
    getCaseStudy,
    getCaseStudyById,
    createCaseStudy,
    updateCaseStudyById,
    deleteCaseStudyById
};