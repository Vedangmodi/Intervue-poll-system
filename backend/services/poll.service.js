const Poll = require('../models/Poll.model');
const Vote = require('../models/Vote.model');

class PollService {
  /**
   * Create a new poll
   */
  async createPoll(question, options, duration = 60) {
    try {
      // Check if there's an active poll
      const activePoll = await this.getActivePoll();
      if (activePoll) {
        throw new Error('An active poll already exists. Please wait for it to complete.');
      }

      // Validate inputs
      if (!question || !options || options.length < 2) {
        throw new Error('Question and at least 2 options are required');
      }

      if (options.length > 10) {
        throw new Error('Maximum 10 options allowed');
      }

      if (duration < 10 || duration > 300) {
        throw new Error('Duration must be between 10 and 300 seconds');
      }

      // Create poll with options
      const pollOptions = options.map(opt => ({
        text: opt.trim(),
        votes: 0
      }));

      const poll = new Poll({
        question: question.trim(),
        options: pollOptions,
        duration,
        status: 'pending'
      });

      await poll.save();
      return poll;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Start a poll
   */
  async startPoll(pollId) {
    try {
      // Check if there's already an active poll
      const activePoll = await this.getActivePoll();
      if (activePoll && activePoll._id.toString() !== pollId) {
        throw new Error('An active poll already exists. Please wait for it to complete.');
      }

      const poll = await Poll.findById(pollId);
      if (!poll) {
        throw new Error('Poll not found');
      }

      if (poll.status === 'active') {
        return poll; // Already active
      }

      if (poll.status === 'completed') {
        throw new Error('Cannot start a completed poll');
      }

      // Set start and end times
      const now = new Date();
      poll.startTime = now;
      poll.endTime = new Date(now.getTime() + poll.duration * 1000);
      poll.status = 'active';

      await poll.save();
      return poll;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Submit a vote
   */
  async submitVote(pollId, studentId, studentName, optionIndex) {
    try {
      const poll = await Poll.findById(pollId);
      if (!poll) {
        throw new Error('Poll not found');
      }

      if (poll.status !== 'active') {
        throw new Error('Poll is not active');
      }

      // Check if time has expired
      const remainingTime = this.calculateRemainingTime(poll);
      if (remainingTime <= 0) {
        throw new Error('Poll time has expired');
      }

      // Validate option index
      if (optionIndex < 0 || optionIndex >= poll.options.length) {
        throw new Error('Invalid option index');
      }

      // Check if student already voted (database unique index will also prevent this)
      const existingVote = await Vote.findOne({ pollId, studentId });
      if (existingVote) {
        throw new Error('You have already voted for this poll');
      }

      // Create vote
      const vote = new Vote({
        pollId,
        studentId,
        studentName,
        optionIndex
      });

      await vote.save();

      // Update poll vote counts
      poll.options[optionIndex].votes += 1;
      poll.totalVotes += 1;
      await poll.save();

      return vote;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active poll
   */
  async getActivePoll() {
    try {
      const poll = await Poll.findOne({ status: 'active' })
        .sort({ createdAt: -1 });
      return poll;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get poll by ID
   */
  async getPollById(pollId) {
    try {
      const poll = await Poll.findById(pollId);
      return poll;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate remaining time for a poll
   */
  calculateRemainingTime(poll) {
    if (!poll || !poll.endTime || poll.status !== 'active') {
      return 0;
    }

    const now = new Date();
    const endTime = new Date(poll.endTime);
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    return remaining;
  }

  /**
   * Get poll results
   */
  async getPollResults(pollId) {
    try {
      const poll = await Poll.findById(pollId);
      if (!poll) {
        throw new Error('Poll not found');
      }

      // Calculate percentages based on stored votes in poll object
      const results = poll.options.map((option, index) => {
        const voteCount = option.votes;
        const percentage = poll.totalVotes > 0 
          ? Math.round((voteCount / poll.totalVotes) * 100) 
          : 0;

        return {
          optionIndex: index,
          text: option.text,
          votes: voteCount,
          percentage
        };
      });

      return {
        results,
        totalVotes: poll.totalVotes
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Complete a poll
   */
  async completePoll(pollId) {
    try {
      const poll = await Poll.findById(pollId);
      if (!poll) {
        throw new Error('Poll not found');
      }

      poll.status = 'completed';
      await poll.save();
      return poll;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get poll history
   */
  async getPollHistory(limit = 50) {
    try {
      const polls = await Poll.find({ status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      // Get results for each poll
      const history = await Promise.all(
        polls.map(async (poll) => {
          const results = await this.getPollResults(poll._id);
          return {
            ...poll,
            results: results.results,
            totalVotes: results.totalVotes
          };
        })
      );

      return history;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PollService();

