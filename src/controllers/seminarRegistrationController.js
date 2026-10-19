const SeminarRegistration = require('../models/SeminarRegistration');
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/sendEmail');

// Helper to escape special regex characters safely
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


// @desc    Submit a new seminar registration
// @route   POST /api/seminars/register
// @access  Public
const registerForSeminar = catchAsync(async (req, res) => {
  try {
    const registration = await SeminarRegistration.create(req.body);

    // Send email to student
    const studentEmailOptions = {
      email: registration.email,
      subject: `Seminar Registration Confirmed: ${registration.seminarBatch}`,
      html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>You're Registered — Alphabit Skill</title>
                </head>
                <body style="margin:0;padding:0;background-color:#F0EFF4;font-family:Arial, Helvetica, sans-serif;">

                <div style="display:none;max-height:0;overflow:hidden;">
                  You're officially registered for the Alphabit Skill seminar. See you there!
                </div>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0EFF4;padding:32px 16px;">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 8px 30px rgba(30,15,70,0.08);">

                        <!-- Header (matches homepage hero gradient) -->
                        <tr>
                          <td style="background:linear-gradient(135deg,#6C4CE0,#7B5CFA);background-color:#6C4CE0;padding:36px 32px 34px;text-align:center;">
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                              <tr>
                                <td style="vertical-align:middle;line-height:1;">
                                  <img src="https://res.cloudinary.com/dn4blj1nq/image/upload/v1783683104/logo.webp" alt="Alphabit Skill" style="height:40px;width:auto;border-radius:8px;display:inline-block;vertical-align:middle;background-color:#ffffff;padding:4px;" />
                                </td>
                                <td style="padding-left:10px;color:#ffffff;font-size:18px;font-weight:bold;vertical-align:middle;">Alphabit Skill</td>
                              </tr>
                            </table>

                            <!-- headline mixing bold sans + italic serif accent, matching hero "Future." style -->
                            <h1 style="color:#ffffff;font-size:26px;line-height:1.35;margin:0;font-weight:800;font-family:Arial, Helvetica, sans-serif;">
                              You're In, ${registration.name}!<br>
                              <span style="font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-weight:normal;color:#F6C445;">Seat Confirmed.</span>
                            </h1>
                          </td>
                        </tr>

                        <!-- rotating-badge style element simplified for email: a simple pill -->
                        <tr>
                          <td align="center" style="padding:0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:-18px;">
                              <tr>
                                <td style="background-color:#ffffff;border:1px solid #E7E4EA;border-radius:999px;padding:9px 20px;font-size:12px;font-weight:bold;color:#6C4CE0;box-shadow:0 10px 24px -10px rgba(30,15,70,0.2);">
                                  🎓 &nbsp;YOU'RE ATTENDING&nbsp; 🎓
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                          <td style="padding:32px 32px 8px;">
                            <p style="color:#5B5763;font-size:14.5px;line-height:1.7;margin:0 0 24px;">
                              Thanks for registering for our free student seminar. Here are the details you need —
                              save this email, we'll see you there.
                            </p>

                            <!-- Details card -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F6FB;border:1px solid #E7E4EA;border-radius:18px;margin-bottom:22px;">
                              <tr>
                                <td style="padding:22px 24px;">
                                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="padding:8px 0;font-size:13.5px;color:#151217;width:90px;font-weight:bold;">📅 Date</td>
                                      <td style="padding:8px 0;font-size:13.5px;color:#5B5763;">Saturday, 2 August 2026</td>
                                    </tr>
                                    <tr>
                                      <td style="padding:8px 0;font-size:13.5px;color:#151217;font-weight:bold;">⏱ Time</td>
                                      <td style="padding:8px 0;font-size:13.5px;color:#5B5763;">4:00 PM – 6:00 PM IST</td>
                                    </tr>
                                    <tr>
                                      <td style="padding:8px 0;font-size:13.5px;color:#151217;font-weight:bold;">📍 Venue</td>
                                      <td style="padding:8px 0;font-size:13.5px;color:#5B5763;">Alphabit Skill Studio, Rajkot</td>
                                    </tr>
                                    <tr>
                                      <td style="padding:8px 0;font-size:13.5px;color:#151217;font-weight:bold;">🎓 Topic</td>
                                      <td style="padding:8px 0;font-size:13.5px;color:#5B5763;">Cracking Your First Tech Career</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>

                            <!-- Your details recap (orange sticker-style badge title like homepage stat callouts) -->
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                              <tr>
                                <td style="background-color:#FDECE6;color:#F4632B;font-size:11px;font-weight:bold;padding:5px 12px;border-radius:999px;letter-spacing:0.03em;">
                                  YOUR SUBMITTED DETAILS
                                </td>
                              </tr>
                            </table>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:26px;">
                              <tr><td style="padding:5px 0;font-size:13px;color:#151217;"><b>Phone:</b> <span style="color:#5B5763;">${registration.phone}</span></td></tr>
                              <tr><td style="padding:5px 0;font-size:13px;color:#151217;"><b>Email:</b> <span style="color:#5B5763;">${registration.email}</span></td></tr>
                              <tr><td style="padding:5px 0;font-size:13px;color:#151217;"><b>College:</b> <span style="color:#5B5763;">${registration.college}</span></td></tr>
                              <tr><td style="padding:5px 0;font-size:13px;color:#151217;"><b>Course:</b> <span style="color:#5B5763;">${registration.course}</span></td></tr>
                              <tr><td style="padding:5px 0;font-size:13px;color:#151217;"><b>City:</b> <span style="color:#5B5763;">${registration.city}</span></td></tr>
                            </table>

                            <!-- What to bring -->
                            <p style="color:#151217;font-size:14px;font-weight:bold;margin:0 0 10px;">What to bring</p>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                              <tr><td style="padding:4px 0;font-size:13.5px;color:#5B5763;">✓ A notebook &amp; pen — this is a hands-on session</td></tr>
                              <tr><td style="padding:4px 0;font-size:13.5px;color:#5B5763;">✓ Your enthusiasm — no prior experience needed</td></tr>
                              <tr><td style="padding:4px 0;font-size:13.5px;color:#5B5763;">✓ This email or your registered phone number for entry</td></tr>
                            </table>

                            <!-- CTA: purple pill button like site's "Join the Studio" -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center" style="padding:4px 0 8px;">
                                  <a href="https://maps.google.com/?q=Alphabit+Skill+Studio+Rajkot" style="display:inline-block;background-color:#6C4CE0;color:#ffffff;font-size:14.5px;font-weight:bold;text-decoration:none;padding:14px 34px;border-radius:999px;">
                                    Get Directions →
                                  </a>
                                </td>
                              </tr>
                            </table>

                            <p style="color:#9C98A3;font-size:12.5px;text-align:center;margin:18px 0 0;">
                              Add this to your calendar so you don't miss it.
                            </p>
                          </td>
                        </tr>

                        <tr>
                          <td style="padding:28px 32px 0;"><div style="border-top:1px solid #E7E4EA;"></div></td>
                        </tr>

                        <tr>
                          <td style="padding:24px 32px 8px;text-align:center;">
                            <p style="color:#5B5763;font-size:13px;margin:0 0 6px;">Questions before the seminar?</p>
                            <p style="color:#151217;font-size:13.5px;font-weight:bold;margin:0;">
                              📞 +91 9409207327 &nbsp;|&nbsp; ✉️ alphabitskillstudio@gmail.com
                            </p>
                          </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                          <td style="background-color:#151217;padding:26px 32px;text-align:center;border-radius:0 0 28px 28px;">
                            <p style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:bold;margin:0 0 4px;">Alphabit Skill</p>
                            <p style="color:rgba(255,255,255,0.45);font-size:11.5px;margin:0 0 14px;">Rajkot, Gujarat</p>
                            <p style="color:rgba(255,255,255,0.35);font-size:11px;margin:0;">© 2026 Alphabit Skill. All rights reserved.</p>
                          </td>
                        </tr>

                      </table>
                    </td>
                  </tr>
                </table>

                </body>
                </html>
            `
    };

    // Send email to admin
    const adminEmailOptions = {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: `New Seminar Registration: ${registration.name}`,
      html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 30px; color: #1f2937;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); border-top: 6px solid #e11d48;">
                        <div style="padding: 24px; text-align: center; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                            <h2 style="margin: 0; color: #e11d48; font-size: 20px; font-weight: 700;">New Seminar Registration Alert</h2>
                            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Alphabit Skill Administrative Notification</p>
                        </div>
                        <div style="padding: 30px 24px;">
                            <p style="line-height: 1.5; color: #475569; font-size: 15px; margin-top: 0;">A new registration has been received for <strong>${registration.seminarBatch}</strong>. Below are the student registration details:</p>
                            
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 20px;">
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-weight: 500; width: 35%;">Student Name</td>
                                    <td style="padding: 10px 0; color: #1e293b; font-weight: 600;">${registration.name}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Email Address</td>
                                    <td style="padding: 10px 0; color: #4f46e5; text-decoration: none;">${registration.email}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Phone Number</td>
                                    <td style="padding: 10px 0; color: #1e293b;">${registration.phone}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">College/School</td>
                                    <td style="padding: 10px 0; color: #1e293b;">${registration.college}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Course/Stream</td>
                                    <td style="padding: 10px 0; color: #1e293b;">${registration.course}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">City</td>
                                    <td style="padding: 10px 0; color: #1e293b;">${registration.city}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Source Channel</td>
                                    <td style="padding: 10px 0; color: #1e293b;"><span style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${registration.source}</span></td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Registered On</td>
                                    <td style="padding: 10px 0; color: #1e293b;">${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</td>
                                </tr>
                            </table>
                        </div>
                        <div style="padding: 20px 24px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
                            <p style="margin: 0;">This email was automatically generated by the Alphabit Skill Backend Administrative service.</p>
                        </div>
                    </div>
                </div>
            `
    };

    // Send emails asynchronously (don't block response)
    sendEmail(studentEmailOptions).catch(err => console.error('Student email error:', err));
    sendEmail(adminEmailOptions).catch(err => console.error('Admin email error:', err));

    res.status(201).json({
      success: true,
      message: 'Registered successfully',
      data: registration
    });
  } catch (error) {
    // E11000 is a duplicate key error in MongoDB
    if (error.code === 11000) {
      throw new AppError('You have already registered for this seminar with this phone number.', 409);
    }
    throw error;
  }
});

// @desc    Get all seminar registrations (with pagination, filtering, search)
// @route   GET /api/admin/seminars
// @access  Private/Admin
const getSeminarRegistrations = catchAsync(async (req, res) => {
  const { batch, status, search, page = 1, limit = 10 } = req.query;

  const query = {};

  if (batch) {
    query.seminarBatch = batch;
  }

  if (status) {
    query.status = status;
  }

  if (search && search.trim()) {
    const safeSearch = escapeRegex(search.trim());
    const searchRegex = new RegExp(safeSearch, 'i');
    query.$or = [
      { name: searchRegex },
      { phone: searchRegex },
      { email: searchRegex },
      { college: searchRegex },
      { course: searchRegex },
      { city: searchRegex },
      { source: searchRegex },
      { seminarBatch: searchRegex }
    ];
  }

  const skipIndex = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await SeminarRegistration.countDocuments(query);
  const registrations = await SeminarRegistration.find(query)
    .sort({ createdAt: -1 })
    .skip(skipIndex)
    .limit(parseInt(limit, 10));

  res.status(200).json({
    success: true,
    data: registrations,
    total,
    page: parseInt(page, 10),
    totalPages: Math.ceil(total / parseInt(limit, 10))
  });
});

// @desc    Get single seminar registration by ID
// @route   GET /api/admin/seminars/:id
// @access  Private/Admin
const getSeminarRegistrationById = catchAsync(async (req, res) => {
  const registration = await SeminarRegistration.findById(req.params.id);
  if (!registration) {
    throw new AppError('Registration not found', 404);
  }
  res.status(200).json({
    success: true,
    data: registration
  });
});

// @desc    Update status of a seminar registration
// @route   PUT /api/admin/seminars/:id
// @access  Private/Admin
const updateSeminarStatus = catchAsync(async (req, res) => {
  const { status } = req.body;

  const registration = await SeminarRegistration.findByIdAndUpdate(
    req.params.id,
    { status },
    { returnDocument: 'after', runValidators: true }
  );

  if (!registration) {
    throw new AppError('Registration not found', 404);
  }

  res.status(200).json({
    success: true,
    data: registration
  });
});

// @desc    Delete a seminar registration permanently
// @route   DELETE /api/admin/seminars/:id
// @access  Private/Admin
const deleteSeminarRegistration = catchAsync(async (req, res) => {
  const registration = await SeminarRegistration.findByIdAndDelete(req.params.id);
  if (!registration) {
    throw new AppError('Registration not found', 404);
  }
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Export seminar registrations as CSV
// @route   GET /api/admin/seminars/export
// @access  Private/Admin
const exportSeminarRegistrations = catchAsync(async (req, res) => {
  const { batch, status, search } = req.query;

  const query = {};

  if (batch) {
    query.seminarBatch = batch;
  }

  if (status) {
    query.status = status;
  }

  if (search && search.trim()) {
    const safeSearch = escapeRegex(search.trim());
    const searchRegex = new RegExp(safeSearch, 'i');
    query.$or = [
      { name: searchRegex },
      { phone: searchRegex },
      { email: searchRegex },
      { college: searchRegex },
      { course: searchRegex },
      { city: searchRegex },
      { source: searchRegex },
      { seminarBatch: searchRegex }
    ];
  }

  const registrations = await SeminarRegistration.find(query).sort({ createdAt: -1 });

  // Custom CSV builder
  const fields = ['Name', 'Phone', 'Email', 'College', 'Course', 'City', 'Source', 'Batch', 'Status', 'Registered On'];
  let csvContent = fields.join(',') + '\r\n';

  registrations.forEach((reg) => {
    const formattedDate = reg.createdAt ? reg.createdAt.toISOString() : '';
    const row = [
      `"${(reg.name || '').replace(/"/g, '""')}"`,
      `"${reg.phone || ''}"`,
      `"${(reg.email || '').replace(/"/g, '""')}"`,
      `"${(reg.college || '').replace(/"/g, '""')}"`,
      `"${(reg.course || '').replace(/"/g, '""')}"`,
      `"${(reg.city || '').replace(/"/g, '""')}"`,
      `"${reg.source || ''}"`,
      `"${(reg.seminarBatch || '').replace(/"/g, '""')}"`,
      `"${reg.status || ''}"`,
      `"${formattedDate}"`
    ];
    csvContent += row.join(',') + '\r\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=seminar_registrations_${Date.now()}.csv`);
  res.status(200).send(csvContent);
});

// @desc    Get dashboard statistics for seminar registrations
// @route   GET /api/admin/seminars/stats
// @access  Private/Admin
const getSeminarStats = catchAsync(async (req, res) => {
  // Total count
  const total = await SeminarRegistration.countDocuments();

  // Today's count
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayCount = await SeminarRegistration.countDocuments({
    createdAt: { $gte: startOfToday }
  });

  // Counts by status
  const byStatusData = await SeminarRegistration.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const byStatus = byStatusData.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  // Counts by source
  const bySourceData = await SeminarRegistration.aggregate([
    { $group: { _id: '$source', count: { $sum: 1 } } }
  ]);
  const bySource = bySourceData.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  // Counts by batch
  const byBatchData = await SeminarRegistration.aggregate([
    { $group: { _id: '$seminarBatch', count: { $sum: 1 } } }
  ]);
  const byBatch = byBatchData.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      total,
      todayCount,
      byStatus,
      bySource,
      byBatch
    }
  });
});

module.exports = {
  registerForSeminar,
  getSeminarRegistrations,
  getSeminarRegistrationById,
  updateSeminarStatus,
  deleteSeminarRegistration,
  exportSeminarRegistrations,
  getSeminarStats
};
