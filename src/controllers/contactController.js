const Contact = require('../models/Contact');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Submit a new contact form message
// @route   POST /api/contacts
// @access  Public
const submitContact = catchAsync(async (req, res) => {
    const { firstName, lastName, email, contactNumber, subject, message } = req.body;

    const contact = await Contact.create({
        firstName,
        lastName: lastName || '',
        email,
        contactNumber,
        subject,
        message
    });

    res.status(201).json({
        success: true,
        message: 'Contact form message submitted successfully.',
        data: contact
    });
});

// @desc    Get all contact form messages (Admin)
// @route   GET /api/admin/contacts
// @access  Private / Admin
const getContacts = catchAsync(async (req, res) => {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: contacts.length,
        data: contacts
    });
});

// @desc    Update contact status (unread/read/responded)
// @route   PATCH /api/admin/contacts/:id/status
// @access  Private / Admin
const updateContactStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    
    if (!['unread', 'read', 'responded'].includes(status)) {
        return next(new AppError('Invalid status value', 400));
    }

    const contact = await Contact.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
    );

    if (!contact) {
        return next(new AppError('Contact message not found', 404));
    }

    res.status(200).json({
        success: true,
        data: contact
    });
});

// @desc    Delete contact message (Admin)
// @route   DELETE /api/admin/contacts/:id
// @access  Private / Admin
const deleteContact = catchAsync(async (req, res, next) => {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
        return next(new AppError('Contact message not found', 404));
    }

    res.status(200).json({
        success: true,
        data: {}
    });
});

module.exports = {
    submitContact,
    getContacts,
    updateContactStatus,
    deleteContact
};
