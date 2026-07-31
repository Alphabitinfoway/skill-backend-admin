const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');

// Upload handler helper
const handleFileUpload = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const isPdf = req.file.mimetype === 'application/pdf' || (req.file.originalname && req.file.originalname.toLowerCase().endsWith('.pdf'));

        const cloudinaryUrl = req.file.path;

        res.status(200).json({
            message: `${isPdf ? 'PDF' : 'File'} uploaded successfully`,
            fileUrl: cloudinaryUrl,
            imageUrl: cloudinaryUrl,
            pdfUrl: cloudinaryUrl
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload an image or PDF to Cloudinary
// @route   POST /api/upload
// @access  Public
router.post('/', (req, res, next) => {
    const singleUpload = upload.single('file');
    singleUpload(req, res, (err) => {
        if (err || !req.file) {
            const imgUpload = upload.single('image');
            imgUpload(req, res, (err2) => {
                if (err2 || !req.file) {
                    const pdfUpload = upload.single('pdf');
                    return pdfUpload(req, res, () => handleFileUpload(req, res));
                }
                return handleFileUpload(req, res);
            });
        } else {
            return handleFileUpload(req, res);
        }
    });
});

// @desc    Upload a PDF specifically to Cloudinary
// @route   POST /api/upload/pdf
router.post('/pdf', upload.single('pdf'), handleFileUpload);

module.exports = router;
