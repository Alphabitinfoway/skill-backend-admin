const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const AppError = require('../utils/AppError');

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify connection
cloudinary.api.ping()
    .then(() => console.log('Cloudinary Connected Successfully! ☁️'))
    .catch((error) => console.error('Cloudinary Connection Error:', error.message));

// Setup Multer Storage with Cloudinary for all files (Images & PDFs)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isPdf = file.mimetype === 'application/pdf' || (file.originalname && file.originalname.toLowerCase().endsWith('.pdf'));
        if (isPdf) {
            const nameWithoutExt = file.originalname ? file.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_") : "pdf";
            return {
                folder: 'skills-pdf-uploads',
                resource_type: 'raw',
                public_id: `${nameWithoutExt}-${Date.now()}.pdf`
            };
        }
        return {
            folder: 'alphabit_skill_admin',
            resource_type: 'auto',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf']
        };
    }
});

const resumeStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const safeName = file.originalname
            .replace(/\.[^/.]+$/, '')
            .replace(/[^a-zA-Z0-9_-]/g, '_');
        const extension = file.originalname.split('.').pop().toLowerCase();

        return {
            folder: 'alphabit_skill_career_resumes',
            resource_type: 'raw',
            public_id: `resume-${Date.now()}-${safeName}.${extension}`
        };
    }
});

// Initialize multer with Cloudinary storage
const upload = multer({ storage: storage });
const resumeUpload = multer({
    storage: resumeStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            return callback(null, true);
        }

        callback(new AppError('Resume must be a PDF, DOC, or DOCX file', 400));
    }
});

module.exports = {
    cloudinary,
    upload,
    resumeUpload,
    pdfUpload: upload
};
