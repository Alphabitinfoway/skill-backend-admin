const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please add a first name'],
        trim: true,
        maxlength: [50, 'First name cannot be more than 50 characters']
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: [50, 'Last name cannot be more than 50 characters'],
        default: ''
    },
    email: {
        type: String,
        required: [true, 'Please add an email address'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please add a valid email address']
    },
    contactNumber: {
        type: String,
        required: [true, 'Please add a contact number'],
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Please add a subject'],
        trim: true,
        maxlength: [200, 'Subject cannot be more than 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Please add a message'],
        trim: true,
        maxlength: [2000, 'Message cannot be more than 2000 characters']
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'responded'],
        default: 'unread'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
