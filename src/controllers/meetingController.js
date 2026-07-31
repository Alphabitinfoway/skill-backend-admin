const Meeting = require('../models/Meeting');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/AppError');

// Helper to format YouTube/Vimeo URLs into standard watchable links for new tab opening
const formatWatchableVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';

    // YouTube regex match (watch?v=, youtu.be/, shorts/, embed/)
    const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
        return `https://www.youtube.com/watch?v=${ytMatch[1]}`;
    }

    // Vimeo regex match
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
        return `https://vimeo.com/${vimeoMatch[1]}`;
    }

    return trimmed;
};

// @desc    Get all meetings
// @route   GET /api/meetings
// @access  Public
const getMeetings = catchAsync(async (req, res) => {
    const { skillSlug, slug } = req.query;
    const targetSlug = skillSlug || slug;
    
    let filter = {};
    if (targetSlug) {
        filter = {
            $or: [
                { skillSlug: targetSlug },
                { skillSlug: 'all' },
                { skillSlug: '' },
                { skillSlug: { $exists: false } }
            ]
        };
    }

    const meetings = await Meeting.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: meetings.length, data: meetings });
});

// @desc    Get single meeting by ID
// @route   GET /api/meetings/:id
// @access  Public
const getMeetingById = catchAsync(async (req, res) => {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
        throw new AppError('Meeting not found', 404);
    }
    res.status(200).json({ success: true, data: meeting });
});

// @desc    Create new meeting
// @route   POST /api/admin/meetings
// @access  Private/Admin
const createMeeting = catchAsync(async (req, res) => {
    const meetingData = {
        title: req.body.title,
        subtitle: req.body.subtitle,
        videoUrl: formatWatchableVideoUrl(req.body.videoUrl),
        skillSlug: req.body.skillSlug || 'all'
    };
    
    if (req.files) {
        if (req.files.image1 && req.files.image1[0]) {
            meetingData.image1 = req.files.image1[0].path;
        }
        if (req.files.image2 && req.files.image2[0]) {
            meetingData.image2 = req.files.image2[0].path;
        }
    }
    
    const meeting = await Meeting.create(meetingData);
    res.status(201).json({ success: true, data: meeting });
});

// @desc    Update meeting by ID
// @route   PUT /api/admin/meetings/:id
// @access  Private/Admin
const updateMeetingById = catchAsync(async (req, res) => {
    let meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
        throw new AppError('Meeting not found', 404);
    }
    
    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.subtitle !== undefined) updateData.subtitle = req.body.subtitle;
    if (req.body.videoUrl !== undefined) updateData.videoUrl = formatWatchableVideoUrl(req.body.videoUrl);
    if (req.body.skillSlug !== undefined) updateData.skillSlug = req.body.skillSlug;
    
    if (req.files) {
        if (req.files.image1 && req.files.image1[0]) {
            updateData.image1 = req.files.image1[0].path;
        }
        if (req.files.image2 && req.files.image2[0]) {
            updateData.image2 = req.files.image2[0].path;
        }
    }
    
    meeting = await Meeting.findByIdAndUpdate(req.params.id, updateData, {
        returnDocument: 'after',
        runValidators: true
    });
    
    res.status(200).json({ success: true, data: meeting });
});

// @desc    Delete meeting
// @route   DELETE /api/admin/meetings/:id
// @access  Private/Admin
const deleteMeetingById = catchAsync(async (req, res) => {
    const meeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!meeting) {
        throw new AppError('Meeting not found', 404);
    }
    res.status(200).json({ success: true, data: {} });
});

module.exports = {
    getMeetings,
    getMeetingById,
    createMeeting,
    updateMeetingById,
    deleteMeetingById
};
