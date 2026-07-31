const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
    skillSlug: {
        type: String,
        required: [true, 'Please add a skill slug'],
        unique: true,
        trim: true,
        lowercase: true
    },
    pdfUrl: {
        type: String,
        required: [true, 'Please provide or upload a PDF document'],
        trim: true
    },
    title: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Syllabus', syllabusSchema);
