const Job = require('../models/Job');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/AppError');

const getPublicJobs = catchAsync(async (req, res) => {
    const [departments, jobs] = await Promise.all([
        Job.distinct('department', { status: 'published' }),
        Job.find({
            status: 'published',
            ...(req.query.department ? { department: req.query.department } : {})
        }).select('department title location jobType experience description responsibilities requirements skills sortOrder createdAt updatedAt')
            .sort({ sortOrder: 1, createdAt: -1 })
    ]);

    res.status(200).json({
        success: true,
        count: jobs.length,
        departments: departments.sort((left, right) => left.localeCompare(right)),
        data: jobs
    });
});

const getPublicJobById = catchAsync(async (req, res, next) => {
    const job = await Job.findOne({ _id: req.params.id, status: 'published' })
        .select('department title location jobType experience description responsibilities requirements skills createdAt updatedAt');
    if (!job) return next(new AppError('Job not found', 404));

    res.status(200).json({ success: true, data: job });
});

const getJobs = catchAsync(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.search) {
        const search = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [{ title: search }, { department: search }];
    }

    const jobs = await Job.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
});

const getJobById = catchAsync(async (req, res, next) => {
    const job = await Job.findById(req.params.id);
    if (!job) return next(new AppError('Job not found', 404));

    res.status(200).json({ success: true, data: job });
});

const createJob = catchAsync(async (req, res) => {
    const job = await Job.create({ ...req.body, createdBy: req.user?._id });
    res.status(201).json({ success: true, data: job });
});

const updateJob = catchAsync(async (req, res, next) => {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!job) return next(new AppError('Job not found', 404));

    res.status(200).json({ success: true, data: job });
});

const updateJobStatus = catchAsync(async (req, res, next) => {
    const job = await Job.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
        new: true,
        runValidators: true
    });
    if (!job) return next(new AppError('Job not found', 404));

    res.status(200).json({ success: true, data: job });
});

const deleteJob = catchAsync(async (req, res, next) => {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return next(new AppError('Job not found', 404));

    res.status(200).json({ success: true, data: {} });
});

module.exports = {
    getPublicJobs,
    getPublicJobById,
    getJobs,
    getJobById,
    createJob,
    updateJob,
    updateJobStatus,
    deleteJob
};