const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.ObjectId,
        ref: 'Job',
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add your name'],
        trim: true,
        maxlength: [120, 'Name cannot be more than 120 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add your email'],
        trim: true,
        lowercase: true,
        maxlength: [254, 'Email cannot be more than 254 characters']
    },
    phone: {
        type: String,
        required: [true, 'Please add your phone number'],
        trim: true,
        maxlength: [30, 'Phone number cannot be more than 30 characters']
    },
    coverLetter: {
        type: String,
        trim: true,
        maxlength: [5000, 'Cover letter cannot be more than 5000 characters'],
        default: ''
    },
    resume: {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        originalName: { type: String, required: true },
        format: { type: String, default: '' }
    },
    status: {
        type: String,
        enum: ['submitted', 'reviewing', 'shortlisted', 'rejected', 'hired'],
        default: 'submitted'
    }
}, {
    timestamps: true
});

applicationSchema.index({ job: 1, createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);