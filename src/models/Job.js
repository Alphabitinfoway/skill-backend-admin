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
    description: {
        type: String,
        required: [true, 'Please add a job description'],
        trim: true,
        maxlength: [5000, 'Description cannot be more than 5000 characters']
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