const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  optionIndex: {
    type: Number,
    required: true,
    min: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Unique index to prevent duplicate votes
voteSchema.index({ pollId: 1, studentId: 1 }, { unique: true });

// Index for vote lookups
voteSchema.index({ pollId: 1 });

module.exports = mongoose.model('Vote', voteSchema);

