const pollService = require('../services/poll.service');
const userService = require('../services/user.service');
const Vote = require('../models/Vote.model');
const { startPollTimer } = require('../sockets/poll.socket');

class PollController {
  /**
   * Create a new poll
   */
  async createPoll(req, res) {
    try {
      const { question, options, duration } = req.body;
      const poll = await pollService.createPoll(question, options, duration || 60);
      res.json(poll);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Start a poll
   */
  async startPoll(req, res) {
    try {
      const { pollId } = req.params;
      const poll = await pollService.startPoll(pollId);
      
      // Broadcast poll_started event to all clients via socket
      if (global.io) {
        const remainingTime = pollService.calculateRemainingTime(poll);
        
        // Start timer
        startPollTimer(global.io, poll);
        
        // Broadcast to all clients
        global.io.emit('poll_started', {
          poll,
          remainingTime
        });
        
        console.log(`Poll ${pollId} started and broadcasted to all clients`);
      }
      
      res.json(poll);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Submit a vote
   */
  async submitVote(req, res) {
    try {
      const { pollId, studentId, studentName, optionIndex } = req.body;
      const vote = await pollService.submitVote(pollId, studentId, studentName, parseInt(optionIndex));
      
      // Get updated results
      const results = await pollService.getPollResults(pollId);
      
      // Broadcast updated results
      if (global.io) {
        global.io.emit('poll_results_updated', {
          pollId,
          results: results.results,
          totalVotes: results.totalVotes
        });
      }
      
      res.json({ success: true, vote });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get active poll
   */
  async getActivePoll(req, res) {
    try {
      const poll = await pollService.getActivePoll();
      if (poll) {
        const remainingTime = pollService.calculateRemainingTime(poll);
        res.json({ poll: { ...poll.toObject(), remainingTime } });
      } else {
        res.json({ poll: null });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get poll state for user (for state recovery)
   */
  async getPollState(req, res) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Check if user is kicked out
      const isKickedOut = await userService.isKickedOut(userId);
      if (isKickedOut) {
        return res.json({ kickedOut: true });
      }

      const poll = await pollService.getActivePoll();
      
      if (!poll) {
        return res.json({
          poll: null,
          hasVoted: false,
          votedOption: null,
          kickedOut: false
        });
      }

      // Check if user has voted
      const vote = await Vote.findOne({
        pollId: poll._id,
        studentId: userId
      });

      const remainingTime = pollService.calculateRemainingTime(poll);
      const hasVoted = !!vote;

      res.json({
        poll: {
          _id: poll._id,
          question: poll.question,
          options: poll.options,
          duration: poll.duration,
          startTime: poll.startTime,
          endTime: poll.endTime,
          remainingTime,
          status: poll.status
        },
        hasVoted,
        votedOption: vote ? vote.optionIndex : null,
        kickedOut: false
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get poll results
   */
  async getPollResults(req, res) {
    try {
      const { pollId } = req.params;
      const results = await pollService.getPollResults(pollId);
      res.json(results);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Complete a poll
   */
  async completePoll(req, res) {
    try {
      const { pollId } = req.params;
      const poll = await pollService.completePoll(pollId);
      
      // Get final results
      const results = await pollService.getPollResults(pollId);
      
      // Broadcast completion
      if (global.io) {
        global.io.emit('poll_completed', {
          pollId,
          results: results.results,
          totalVotes: results.totalVotes
        });
      }
      
      res.json(poll);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new PollController();

