const Visitor = require('../models/Visitor');
const catchAsync = require('../middleware/catchAsync');
const { getClientIp } = require('../utils/ipHelper');

/**
 * @desc    Record page visit & return current unique visitor count
 * @route   GET /api/visitors/count
 * @access  Public
 */
const recordAndGetVisitorCount = catchAsync(async (req, res) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || '';

  /**
   * Atomic Upsert:
   * - If new IP: creates the document, sets createdAt, sets initial visitCount = 1.
   * - If existing IP: only increments visitCount and updates lastVisitedAt.
   */
  const updateResult = await Visitor.updateOne(
    { ip },
    {
      $setOnInsert: {
        ip,
        createdAt: new Date(),
      },
      $set: {
        lastVisitedAt: new Date(),
        userAgent,
      },
      $inc: {
        visitCount: 1,
      },
    },
    { upsert: true }
  );

  const isNewVisitor = Boolean(updateResult.upsertedCount && updateResult.upsertedCount > 0);
  const totalCount = await Visitor.countDocuments();

  res.status(200).json({
    success: true,
    totalCount,
    isNewVisitor,
    ip: process.env.NODE_ENV === 'development' ? ip : undefined,
  });
});

/**
 * @desc    Get total count without recording a visit
 * @route   GET /api/visitors/total
 * @access  Public
 */
const getTotalVisitorCount = catchAsync(async (req, res) => {
  const totalCount = await Visitor.countDocuments();

  res.status(200).json({
    success: true,
    totalCount,
  });
});

/**
 * @desc    Get visitor statistics for Admin
 * @route   GET /api/admin/visitors/stats
 * @access  Private / Admin
 */
const getVisitorStats = catchAsync(async (req, res) => {
  const totalUnique = await Visitor.countDocuments();

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const todayUnique = await Visitor.countDocuments({
    createdAt: { $gte: twentyFourHoursAgo },
  });

  const recentVisitors = await Visitor.find()
    .sort({ lastVisitedAt: -1 })
    .limit(50);

  // Aggregate total page impressions across all unique visitors
  const aggregation = await Visitor.aggregate([
    {
      $group: {
        _id: null,
        totalImpressions: { $sum: '$visitCount' },
      },
    },
  ]);

  const totalImpressions = aggregation.length > 0 ? aggregation[0].totalImpressions : 0;

  res.status(200).json({
    success: true,
    data: {
      totalUnique,
      todayUnique,
      totalImpressions,
      recentVisitors,
    },
  });
});

module.exports = {
  recordAndGetVisitorCount,
  getTotalVisitorCount,
  getVisitorStats,
};
