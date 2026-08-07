const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
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
        required: false // Change to true if authentication is strictly required
    }
}, {
    timestamps: true
});

// Create blog slug from the title before saving
blogSchema.pre('save', function() {
    // If title was modified and the user didn't manually provide a custom slug
    if (this.isModified('title') && !this.isModified('slug')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes
    } else if (this.isModified('slug')) {
        // If a custom slug is provided, make sure it is properly formatted
        this.slug = this.slug
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes
    }
});

module.exports = mongoose.model('Blog', blogSchema);
