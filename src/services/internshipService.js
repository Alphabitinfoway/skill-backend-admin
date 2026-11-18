const Internship = require('../models/Internship');
const AppError = require('../utils/AppError');
const { cloudinary } = require('../config/cloudinary');

const internshipImageFolder = 'alphabit-skill-internship-image';

const getInternshipImagePublicId = (imageUrl) => {
    if (!imageUrl) return null;

    let pathname;
    try {
        pathname = new URL(imageUrl).pathname;
    } catch {
        return null;
    }

    const uploadPath = '/image/upload/';
    const uploadIndex = pathname.indexOf(uploadPath);
    if (uploadIndex === -1) return null;

    const assetPath = pathname.slice(uploadIndex + uploadPath.length);
    const versionedAsset = assetPath.match(/(?:^|\/)v\d+\/(.+)$/);
    if (!versionedAsset) return null;

    let publicId;
    try {
        publicId = decodeURIComponent(versionedAsset[1]).replace(/\.[^/.]+$/, '');
    } catch {
        return null;
    }

    return publicId.startsWith(`${internshipImageFolder}/`) ? publicId : null;
};

const removeInternshipImage = async (imageUrl) => {
    const publicId = getInternshipImagePublicId(imageUrl);
    if (!publicId) return;

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Failed to remove internship image from Cloudinary: ${result.result}`);
    }
};

const editableFields = [
    'title',
    'slug',
    'image',
    'seo',
    'hero',
    'about',
    'executionBenchmark',
    'curriculum',
    'projects',
    'skills',
    'eligibility',
    'prerequisites',
    'benefits',
    'faqs',
    'isPublished'
];

const getAllInternships = async ({ publishedOnly = false } = {}) => {
    const filter = publishedOnly ? { isPublished: true } : {};
    return Internship.find(filter).sort({ createdAt: -1 });
};

const getInternshipBySlug = async (slug) => {
    const internship = await Internship.findOne({ slug, isPublished: true });
    if (!internship) {
        throw new AppError('Internship not found', 404);
    }
    return internship;
};

const getInternshipById = async (id) => {
    const internship = await Internship.findById(id);
    if (!internship) {
        throw new AppError('Internship not found', 404);
    }
    return internship;
};

const createInternship = async (internshipData, file) => {
    return Internship.create({
        ...internshipData,
        ...(file ? { image: file.path } : {})
    });
};

const updateInternshipById = async (id, updateData, file) => {
    const internship = await Internship.findById(id);
    if (!internship) {
        throw new AppError('Internship not found', 404);
    }

    const previousImage = internship.image;
    editableFields.forEach((field) => {
        if (updateData[field] !== undefined) {
            internship[field] = updateData[field];
        }
    });

    if (file) {
        internship.image = file.path;
    }

    await internship.save();
    if (previousImage && previousImage !== internship.image) {
        await removeInternshipImage(previousImage);
    }
    return internship;
};

const deleteInternshipById = async (id) => {
    const internship = await Internship.findByIdAndDelete(id);
    if (!internship) {
        throw new AppError('Internship not found', 404);
    }
    return {};
};

module.exports = {
    getAllInternships,
    getInternshipBySlug,
    getInternshipById,
    createInternship,
    updateInternshipById,
    deleteInternshipById
};
