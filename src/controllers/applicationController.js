const Application = require('../models/Application');
const Job = require('../models/Job');
const { cloudinary } = require('../config/cloudinary');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/AppError');

const removeResume = async (publicId) => {
    if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }
};

const submitApplication = catchAsync(async (req, res, next) => {
    if (!req.file) return next(new AppError('Please upload your resume', 400));

    const job = await Job.findOne({ _id: req.body.jobId, status: 'published' });
    if (!job) {
        await removeResume(req.file.filename);
        return next(new AppError('Job not found or no longer accepting applications', 404));
    }

    try {
        const application = await Application.create({
            job: job._id,
            jobTitle: job.title,
            department: job.department,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            coverLetter: req.body.coverLetter || '',
            resume: {
                url: req.file.path,
                publicId: req.file.filename,
                originalName: req.file.originalname,
                format: req.file.format || ''
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: application
        });
    } catch (error) {
        await removeResume(req.file.filename);
        throw error;
    }
});

const getApplications = catchAsync(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.jobId) filter.job = req.query.jobId;

    const applications = await Application.find(filter)
        .select('-resume.publicId')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
    });
});

const getApplicationById = catchAsync(async (req, res, next) => {
    const application = await Application.findById(req.params.id);
    if (!application) return next(new AppError('Application not found', 404));

    res.status(200).json({ success: true, data: application });
});

const getApplicationResume = catchAsync(async (req, res, next) => {
    const application = await Application.findById(req.params.id).select('resume name jobTitle');
    if (!application) return next(new AppError('Application not found', 404));

    res.status(200).json({
        success: true,
        data: {
            name: application.name,
            jobTitle: application.jobTitle,
            resume: application.resume
        }
    });
});

const updateApplicationStatus = catchAsync(async (req, res, next) => {
    const application = await Application.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true }
    );
    if (!application) return next(new AppError('Application not found', 404));

    res.status(200).json({ success: true, data: application });
});

const deleteApplication = catchAsync(async (req, res, next) => {
    const application = await Application.findById(req.params.id);
    if (!application) return next(new AppError('Application not found', 404));

    await removeResume(application.resume.publicId);
    await application.deleteOne();

    res.status(200).json({ success: true, data: {} });
});

module.exports = {
    submitApplication,
    getApplications,
    getApplicationById,
    getApplicationResume,
    updateApplicationStatus,
    deleteApplication
};