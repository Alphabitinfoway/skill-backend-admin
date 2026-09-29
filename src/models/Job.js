const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    department: {
        type: String,
        required: [true, 'Please add a department'],
        trim: true,
        maxlength: [120, 'Department cannot be more than 120 characters']
    },
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true,
        maxlength: [160, 'Job title cannot be more than 160 characters']
    },
    location: {
        type: String,
        trim: true,
        maxlength: [200, 'Location cannot be more than 200 characters'],
        default: ''
    },
    jobType: {
        type: [{ type: String, enum: ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'] }],
        default: ['Full Time']
    },
    experience: {
        type: String,
        trim: true,
        maxlength: [100, 'Experience cannot be more than 100 characters'],
        default: ''
    },
    description: {
        type: String,
        required: [true, 'Please add a job description'],
        trim: true,
        maxlength: [5000, 'Description cannot be more than 5000 characters']
    },
    responsibilities: {
        type: [String],
        default: []
    },
    requirements: {
        type: [String],
        default: []
    },
    skills: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'closed'],
        default: 'draft'
    },
    sortOrder: {
        type: Number,
        default: 0,
        validate: {
            validator: Number.isInteger,
            message: 'Sort order must be an integer'
        }
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

jobSchema.index({ status: 1, department: 1, sortOrder: 1 });

module.exports = mongoose.model('Job', jobSchema);