const nodemailer = require('nodemailer');

/**
 * Send an email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body content
 */
const sendEmail = async (options) => {
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('SMTP is not fully configured. Email sending skipped. Details:', {
            to: options.email,
            subject: options.subject
        });
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Alphabit'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
