const Blog = require('../models/Blog');
const AppError = require('../utils/AppError');

const getAllBlogs = async () => {
    return await Blog.find().populate('author', 'name email').sort({ createdAt: -1 });
};

const getBlogBySlug = async (slug) => {
    let blog = await Blog.findOne({ slug }).populate('author', 'name email');
    if (!blog && require('mongoose').Types.ObjectId.isValid(slug)) {
        blog = await Blog.findById(slug).populate('author', 'name email');
    }
    if (!blog) {
        throw new AppError('Blog not found', 404);
    }
    return blog;
};

const getBlogById = async (id) => {
    const blog = await Blog.findById(id).populate('author', 'name email');
    if (!blog) {
        throw new AppError('Blog not found', 404);
    }
    return blog;
};

const createBlog = async (blogData, file) => {
    if (file) {
        blogData.image = file.path;
    }
    return await Blog.create(blogData);
};

const updateBlogById = async (id, updateData, file) => {
    let blog = await Blog.findById(id);
    if (!blog) {
        throw new AppError('Blog not found', 404);
    }

    if (file) {
        updateData.image = file.path;
    }

    if (updateData.slug) {
        blog.slug = updateData.slug;
    }

    if (updateData.title !== undefined) blog.title = updateData.title;
    if (updateData.metaTitle !== undefined) blog.metaTitle = updateData.metaTitle;
    if (updateData.metaDescription !== undefined) blog.metaDescription = updateData.metaDescription;
    if (updateData.content !== undefined) blog.content = updateData.content;
    if (updateData.image !== undefined) blog.image = updateData.image;

    await blog.save();
    return blog;
};

const deleteBlogById = async (id) => {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
        throw new AppError('Blog not found', 404);
    }
    return {};
};

module.exports = {
    getAllBlogs,
    getBlogBySlug,
    getBlogById,
    createBlog,
    updateBlogById,
    deleteBlogById
};
