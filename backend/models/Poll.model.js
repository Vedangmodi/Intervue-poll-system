const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true
    },
    votes: {
      type: Number,
      default: 0
    }
  }],
  duration: {
    type: Number,
    required: true,
    min: 10,
    max: 300,
    default: 60
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending'
  },
  totalVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for active poll queries
pollSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Poll', pollSchema);

