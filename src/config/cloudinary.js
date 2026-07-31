const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

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

// Initialize multer with Cloudinary storage
const upload = multer({ storage: storage });

module.exports = {
    cloudinary,
    upload,
    pdfUpload: upload
};
