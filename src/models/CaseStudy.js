const mongoose = require('mongoose');

const caseStudySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    slug: {
        type: String,
        unique: true
    },
    metaTitle: {
        type: String,
        trim: true,
        default: ''
    },
    metaDescription: {
        type: String,
        trim: true,
        default: ''
    },
    content: {
        type: String,
        required: [true, 'Please add some content']
    },
    image: {
        type: String,
        default: 'no-photo.jpg'
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true
});

caseStudySchema.pre('save', function() {
    if (this.isModified('title') && !this.isModified('slug')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    } else if (this.isModified('slug') && this.slug) {
        this.slug = this.slug
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
});

module.exports = mongoose.model('CaseStudy', caseStudySchema);