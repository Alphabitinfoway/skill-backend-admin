const mongoose = require('mongoose');

const stringArray = {
    type: [String],
    default: []
};

const statsSchema = new mongoose.Schema({
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' }
}, { _id: false });

const seoSchema = new mongoose.Schema({
    title: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    keywords: stringArray,
    h1: { type: String, trim: true, default: '' },
    canonical: { type: String, trim: true, default: '' }
}, { _id: false });

const heroSchema = new mongoose.Schema({
    subtitle: { type: String, required: true, trim: true },
    highlights: stringArray,
    stats: [statsSchema]
}, { _id: false });

const aboutSchema = new mongoose.Schema({
    paragraphs: stringArray,
    highlights: stringArray
}, { _id: false });

const benchmarkSchema = new mongoose.Schema({
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true }
}, { _id: false });

const curriculumSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    weeks: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    topics: stringArray,
    stack: stringArray
}, { _id: false });

const projectSchema = new mongoose.Schema({
    category: { type: String, trim: true, default: '' },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    highlights: stringArray,
    stack: stringArray
}, { _id: false });

const skillSchema = new mongoose.Schema({
    category: { type: String, required: true, trim: true },
    items: stringArray
}, { _id: false });

const eligibilitySchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    criteria: { type: String, trim: true, default: '' }
}, { _id: false });

const benefitSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' }
}, { _id: false });

const faqSchema = new mongoose.Schema({
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true }
}, { _id: false });

const internshipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    slug: {
        type: String,
        required: [true, 'Please add a slug'],
        unique: true,
        trim: true,
        lowercase: true
    },
    image: { type: String, default: '' },
    seo: { type: seoSchema, default: () => ({}) },
    hero: { type: heroSchema, required: true },
    about: { type: aboutSchema, default: () => ({}) },
    executionBenchmark: { type: [benchmarkSchema], default: [] },
    curriculum: { type: [curriculumSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    skills: { type: [skillSchema], default: [] },
    eligibility: { type: [eligibilitySchema], default: [] },
    prerequisites: stringArray,
    benefits: { type: [benefitSchema], default: [] },
    faqs: { type: [faqSchema], default: [] },
    isPublished: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Internship', internshipSchema);
