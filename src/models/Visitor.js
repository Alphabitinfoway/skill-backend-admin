const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: [true, 'IP address is required'],
      unique: true,
      trim: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: '',
      trim: true,
    },
    visitCount: {
      type: Number,
      default: 1,
    },
    lastVisitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: If a 24-hour reset is desired instead of permanent tracking,
// uncomment the following line to automatically expire records after 24 hours (86400 seconds):
// visitorSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Visitor', visitorSchema);
