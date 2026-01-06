const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['teacher', 'student'],
    required: true
  },
  socketId: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  kickedOut: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for user lookups
userSchema.index({ userId: 1 });
userSchema.index({ socketId: 1 });

module.exports = mongoose.model('User', userSchema);

