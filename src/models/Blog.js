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
        required: false
    }
}, {
    timestamps: true
});

// Helper to clean and normalize rich text table HTML
function cleanBlogContent(content) {
    if (!content || typeof content !== 'string') return content;
    if (!content.includes('<table')) return content;

    let formatted = content;

    // Strip restrictive colgroup tags from rich-text outputs so table columns distribute naturally
    formatted = formatted.replace(/<colgroup[\s\S]*?<\/colgroup>/gi, '');

    // Ensure table has blog-content-table class
    formatted = formatted.replace(/<table([^>]*)>/gi, (match, attrs) => {
        let cleanAttrs = attrs || '';
        if (!cleanAttrs.includes('class=')) {
            cleanAttrs += ' class="blog-content-table"';
        } else if (!cleanAttrs.includes('blog-content-table')) {
            cleanAttrs = cleanAttrs.replace(/class="([^"]*)"/i, 'class="$1 blog-content-table"');
        }
        return '<table' + cleanAttrs + '>';
    });

    return formatted;
}

// Create blog slug from the title before saving and clean content
blogSchema.pre('save', function() {
    if (this.content) {
        this.content = cleanBlogContent(this.content);
    }

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

module.exports = mongoose.model('Blog', blogSchema);
module.exports.cleanBlogContent = cleanBlogContent;
module.exports.formatBlogContentTables = cleanBlogContent;
