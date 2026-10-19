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
    if ((!process.env.SMTP_HOST && !process.env.SMTP_SERVICE) || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('SMTP is not fully configured. Email sending skipped. Details:', {
            to: options.email,
            subject: options.subject
        });
        return;
    }

    const isGmail =
        process.env.SMTP_SERVICE === 'gmail' ||
        process.env.SMTP_HOST === 'smtp.gmail.com' ||
        (process.env.SMTP_USER && process.env.SMTP_USER.endsWith('@gmail.com'));

    const transportOptions = isGmail
        ? {
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        }
        : {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        };

    const transporter = nodemailer.createTransport(transportOptions);

    const fromName = (process.env.FROM_NAME || 'Alphabit').replace(/^["']|["']$/g, '');
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

    const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
