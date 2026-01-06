const pollService = require('../services/poll.service');
const userService = require('../services/user.service');
const Vote = require('../models/Vote.model');

// Store active connections and poll timers
const activeConnections = new Map();
const pollTimers = new Map();

/**
 * Initialize socket handlers
 */
function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle user registration
    socket.on('register', async (data) => {
      try {
        const { userId, name, role } = data;
        
        if (!userId || !name || !role) {
          socket.emit('error', { message: 'Invalid registration data' });
          return;
        }

        // Ensure user exists and is active
        await userService.createUser(userId, name, role);

        // Update socket ID for user
        await userService.updateSocketId(userId, socket.id);
        activeConnections.set(socket.id, { userId, name, role });

        // Check if user is kicked out
        const isKickedOut = await userService.isKickedOut(userId);
        if (isKickedOut) {
          socket.emit('kicked_out');
          return;
        }

        socket.emit('registered', { success: true });

        // If teacher, send current state
        if (role === 'teacher') {
          const activePoll = await pollService.getActivePoll();
          if (activePoll) {
            const remainingTime = pollService.calculateRemainingTime(activePoll);
            socket.emit('poll_active', {
              poll: activePoll,
              remainingTime
            });
          }

          // Send active students list
          const students = await userService.getActiveStudents();
          socket.emit('students_list', { students });
        }

        // If student, send current poll state
        if (role === 'student') {
          const pollState = await getStudentPollState(userId);
          socket.emit('poll_state', pollState);

          // Notify teachers about updated students list
          const students = await userService.getActiveStudents();
          io.emit('students_list', { students });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle poll creation (teacher only)
    socket.on('create_poll', async (data) => {
      try {
        const connection = activeConnections.get(socket.id);
        if (!connection || connection.role !== 'teacher') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const { question, options, duration } = data;
        const poll = await pollService.createPoll(question, options, duration || 60);
        
        io.emit('poll_created', { poll });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle poll start (teacher only)
    socket.on('start_poll', async (data) => {
      try {
        const connection = activeConnections.get(socket.id);
        if (!connection || connection.role !== 'teacher') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const { pollId } = data;
        const poll = await pollService.startPoll(pollId);
        
        // Start timer
        startPollTimer(io, poll);

        // Broadcast to all clients
        const remainingTime = pollService.calculateRemainingTime(poll);
        io.emit('poll_started', {
          poll,
          remainingTime
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle vote submission (student only)
    socket.on('submit_vote', async (data) => {
      try {
        const connection = activeConnections.get(socket.id);
        if (!connection || connection.role !== 'student') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const { pollId, optionIndex } = data;
        const { userId, name } = connection;

        const vote = await pollService.submitVote(
          pollId,
          userId,
          name,
          parseInt(optionIndex)
        );

        // Get updated results
        const results = await pollService.getPollResults(pollId);
        
        // Send confirmation to student
        socket.emit('vote_submitted', { success: true, vote });

        // Broadcast updated results to all
        io.emit('poll_results_updated', {
          pollId,
          results: results.results,
          totalVotes: results.totalVotes
        });

        // Check if all students have voted
        const students = await userService.getActiveStudents();
        const totalVotes = await Vote.countDocuments({ pollId });
        
        if (totalVotes >= students.length) {
          // All students have voted, notify teacher
          io.to('teacher').emit('all_students_answered');
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle kick student (teacher only)
    socket.on('kick_student', async (data) => {
      try {
        const connection = activeConnections.get(socket.id);
        if (!connection || connection.role !== 'teacher') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const { studentId } = data;
        
        // First, get the student's socketId from database before kicking out
        const User = require('../models/User.model');
        const studentUser = await User.findOne({ userId: studentId });
        
        if (!studentUser) {
          socket.emit('error', { message: 'Student not found' });
          return;
        }

        // Kick out the student
        const user = await userService.kickOutStudent(studentId);

        // Find student's socket using socketId from database
        let studentSocket = null;
        if (studentUser.socketId) {
          studentSocket = io.sockets.sockets.get(studentUser.socketId);
        }
        
        // Fallback: try to find by activeConnections
        if (!studentSocket) {
          studentSocket = Array.from(io.sockets.sockets.values())
            .find(s => {
              const conn = activeConnections.get(s.id);
              return conn && conn.userId === studentId;
            });
        }

        // Notify student if socket found
        if (studentSocket) {
          studentSocket.emit('kicked_out');
          console.log(`Kicked out student ${studentId} and notified via socket ${studentSocket.id}`);
        } else {
          console.log(`Student ${studentId} was kicked out but socket not found (may be disconnected)`);
        }

        // Update students list for teacher
        const students = await userService.getActiveStudents();
        io.emit('students_list', { students });
        
        socket.emit('kick_success', { studentId, message: 'Student kicked out successfully' });
      } catch (error) {
        console.error('Error kicking student:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle request for poll results
    socket.on('get_poll_results', async (data) => {
      try {
        const { pollId } = data;
        const results = await pollService.getPollResults(pollId);
        socket.emit('poll_results', results);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle request for current state
    socket.on('get_state', async () => {
      try {
        const connection = activeConnections.get(socket.id);
        if (!connection) {
          return;
        }

        const { userId, role } = connection;

        if (role === 'teacher') {
          const activePoll = await pollService.getActivePoll();
          if (activePoll) {
            const remainingTime = pollService.calculateRemainingTime(activePoll);
            socket.emit('poll_active', {
              poll: activePoll,
              remainingTime
            });
          }

          const students = await userService.getActiveStudents();
          socket.emit('students_list', { students });
        } else {
          const pollState = await getStudentPollState(userId);
          socket.emit('poll_state', pollState);
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        const connection = activeConnections.get(socket.id);
        if (connection) {
          await userService.disconnectUser(socket.id);
          activeConnections.delete(socket.id);

          // Update students list for teachers after a disconnect
          const students = await userService.getActiveStudents();
          io.emit('students_list', { students });
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
}

/**
 * Start poll timer
 */
function startPollTimer(io, poll) {
  // Clear existing timer for this poll
  if (pollTimers.has(poll._id.toString())) {
    clearInterval(pollTimers.get(poll._id.toString()));
  }

  const pollId = poll._id.toString();
  const interval = setInterval(async () => {
    try {
      const updatedPoll = await pollService.getPollById(pollId);
      if (!updatedPoll || updatedPoll.status !== 'active') {
        clearInterval(interval);
        pollTimers.delete(pollId);
        return;
      }

      const remainingTime = pollService.calculateRemainingTime(updatedPoll);
      
      // Broadcast timer update
      io.emit('timer_update', {
        pollId,
        remainingTime
      });

      // If time expired, complete poll
      if (remainingTime <= 0) {
        await pollService.completePoll(pollId);
        
        // Get final results
        const results = await pollService.getPollResults(pollId);
        
        // Broadcast completion
        io.emit('poll_completed', {
          pollId,
          results: results.results,
          totalVotes: results.totalVotes
        });

        clearInterval(interval);
        pollTimers.delete(pollId);
      }
    } catch (error) {
      console.error('Timer error:', error);
      clearInterval(interval);
      pollTimers.delete(pollId);
    }
  }, 1000); // Update every second

  pollTimers.set(pollId, interval);
}

/**
 * Get student poll state
 */
async function getStudentPollState(userId) {
  // Check if user is kicked out first
  const isKickedOut = await userService.isKickedOut(userId);
  if (isKickedOut) {
    return { kickedOut: true };
  }

  const poll = await pollService.getActivePoll();
  
  if (!poll) {
    return { poll: null, hasVoted: false, kickedOut: false };
  }

  const vote = await Vote.findOne({ 
    pollId: poll._id, 
    studentId: userId 
  });

  const remainingTime = pollService.calculateRemainingTime(poll);
  const hasVoted = !!vote;

  return {
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
    votedOption: vote ? vote.optionIndex : null
  };
}

module.exports = { initializeSocket, startPollTimer };


