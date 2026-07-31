const Syllabus = require('../models/Syllabus');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/AppError');

// Helper to ensure pdfUrl is always returned as a full absolute URL for frontends
const formatFullPdfUrl = (req, pdfUrl) => {
    if (!pdfUrl || typeof pdfUrl !== 'string') return '';
    let trimmed = pdfUrl.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    return `${protocol}://${host}/${cleanPath}`;
};

const formatSyllabusDoc = (req, doc) => {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    if (obj.pdfUrl) {
        obj.pdfUrl = formatFullPdfUrl(req, obj.pdfUrl);
    }
    return obj;
};

// @desc    Get all syllabus items
// @route   GET /api/syllabus
// @access  Public
const getSyllabus = catchAsync(async (req, res) => {
    const { skillSlug, slug } = req.query;
    const targetSlug = skillSlug || slug;

    let filter = {};
    if (targetSlug) {
        filter = {
            $or: [
                { skillSlug: targetSlug.toLowerCase() },
                { skillSlug: 'all' }
            ]
        };
    }

    const syllabusList = await Syllabus.find(filter).sort({ createdAt: -1 });
    const formattedList = syllabusList.map(item => formatSyllabusDoc(req, item));
    res.status(200).json({ success: true, count: formattedList.length, data: formattedList });
});

// @desc    Get single syllabus by slug
// @route   GET /api/syllabus/slug/:slug
// @access  Public
const getSyllabusBySlug = catchAsync(async (req, res) => {
    const { slug } = req.params;
    const targetSlug = slug.toLowerCase();

    const syllabus = await Syllabus.findOne({
        $or: [
            { skillSlug: targetSlug },
            { skillSlug: 'all' }
        ]
    }).sort({ createdAt: -1 });

    if (!syllabus) {
        throw new AppError(`No syllabus PDF found for slug '${slug}'`, 404);
    }

    res.status(200).json({ success: true, data: formatSyllabusDoc(req, syllabus) });
});

// @desc    Get single syllabus by ID
// @route   GET /api/syllabus/:id
// @access  Public
const getSyllabusById = catchAsync(async (req, res) => {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) {
        throw new AppError('Syllabus item not found', 404);
    }
    res.status(200).json({ success: true, data: formatSyllabusDoc(req, syllabus) });
});

const extractFilePath = (fileObj) => {
    if (!fileObj) return '';
    if (fileObj.path && fileObj.path.startsWith('http')) {
        return fileObj.path;
    }
    if (fileObj.filename) {
        return `uploads/${fileObj.filename}`;
    }
    return fileObj.path || '';
};

// @desc    Create new syllabus
// @route   POST /api/admin/syllabus
// @access  Private/Admin
const createSyllabus = catchAsync(async (req, res) => {
    let pdfUrl = req.body.pdfUrl || '';

    // Handle PDF file upload if provided in multipart/form-data
    if (req.files) {
        if (req.files.pdf && req.files.pdf[0]) {
            pdfUrl = extractFilePath(req.files.pdf[0]);
        } else if (req.files.file && req.files.file[0]) {
            pdfUrl = extractFilePath(req.files.file[0]);
        }
    } else if (req.file) {
        pdfUrl = extractFilePath(req.file);
    }

    if (!pdfUrl) {
        throw new AppError('Please upload a PDF file or provide a PDF URL', 400);
    }

    const targetSlug = (req.body.skillSlug || 'all').trim().toLowerCase();

    const syllabusData = {
        skillSlug: targetSlug,
        pdfUrl: pdfUrl.trim(),
        title: req.body.title || targetSlug
    };

    const syllabus = await Syllabus.create(syllabusData);
    res.status(201).json({ success: true, data: formatSyllabusDoc(req, syllabus) });
});

// @desc    Update syllabus by ID
// @route   PUT /api/admin/syllabus/:id
// @access  Private/Admin
const updateSyllabusById = catchAsync(async (req, res) => {
    let syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) {
        throw new AppError('Syllabus item not found', 404);
    }

    const updateData = {};
    if (req.body.skillSlug !== undefined) updateData.skillSlug = req.body.skillSlug.trim().toLowerCase();
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.pdfUrl !== undefined) updateData.pdfUrl = req.body.pdfUrl.trim();

    if (req.files) {
        if (req.files.pdf && req.files.pdf[0]) {
            updateData.pdfUrl = extractFilePath(req.files.pdf[0]);
        } else if (req.files.file && req.files.file[0]) {
            updateData.pdfUrl = extractFilePath(req.files.file[0]);
        }
    } else if (req.file) {
        updateData.pdfUrl = extractFilePath(req.file);
    }

    syllabus = await Syllabus.findByIdAndUpdate(req.params.id, updateData, {
        returnDocument: 'after',
        runValidators: true
    });

    res.status(200).json({ success: true, data: formatSyllabusDoc(req, syllabus) });
});

// @desc    Delete syllabus
// @route   DELETE /api/admin/syllabus/:id
// @access  Private/Admin
const deleteSyllabusById = catchAsync(async (req, res) => {
    const syllabus = await Syllabus.findByIdAndDelete(req.params.id);
    if (!syllabus) {
        throw new AppError('Syllabus item not found', 404);
    }
    res.status(200).json({ success: true, data: {} });
});

module.exports = {
    getSyllabus,
    getSyllabusBySlug,
    getSyllabusById,
    createSyllabus,
    updateSyllabusById,
    deleteSyllabusById
};
