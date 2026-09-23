const mongoose = require('mongoose');
const CaseStudy = require('../models/CaseStudy');
const AppError = require('../utils/AppError');

const getAllCaseStudies = async () => {
    return await CaseStudy.find().populate('author', 'name email').sort({ createdAt: -1 });
};

const getCaseStudyBySlug = async (slug) => {
    let caseStudy = await CaseStudy.findOne({ slug }).populate('author', 'name email');
    if (!caseStudy && mongoose.Types.ObjectId.isValid(slug)) {
        caseStudy = await CaseStudy.findById(slug).populate('author', 'name email');
    }
    if (!caseStudy) {
        throw new AppError('Case study not found', 404);
    }
    return caseStudy;
};

const getCaseStudyById = async (id) => {
    const caseStudy = await CaseStudy.findById(id).populate('author', 'name email');
    if (!caseStudy) {
        throw new AppError('Case study not found', 404);
    }
    return caseStudy;
};

const createCaseStudy = async (caseStudyData, file) => {
    if (file) {
        caseStudyData.image = file.path;
    }
    return await CaseStudy.create(caseStudyData);
};

const updateCaseStudyById = async (id, updateData, file) => {
    const caseStudy = await CaseStudy.findById(id);
    if (!caseStudy) {
        throw new AppError('Case study not found', 404);
    }

    if (file) {
        updateData.image = file.path;
    }

    if (updateData.slug !== undefined) caseStudy.slug = updateData.slug;
    if (updateData.title !== undefined) caseStudy.title = updateData.title;
    if (updateData.metaTitle !== undefined) caseStudy.metaTitle = updateData.metaTitle;
    if (updateData.metaDescription !== undefined) caseStudy.metaDescription = updateData.metaDescription;
    if (updateData.content !== undefined) caseStudy.content = updateData.content;
    if (updateData.image !== undefined) caseStudy.image = updateData.image;

    await caseStudy.save();
    return caseStudy;
};

const deleteCaseStudyById = async (id) => {
    const caseStudy = await CaseStudy.findByIdAndDelete(id);
    if (!caseStudy) {
        throw new AppError('Case study not found', 404);
    }
    return {};
};

module.exports = {
    getAllCaseStudies,
    getCaseStudyBySlug,
    getCaseStudyById,
    createCaseStudy,
    updateCaseStudyById,
    deleteCaseStudyById
};