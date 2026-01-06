import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import { usePollTimer } from '../hooks/usePollTimer';
import { usePollState } from '../hooks/usePollState';
import toast from 'react-hot-toast';

const PollContext = createContext();

export const usePoll = () => {
  const context = useContext(PollContext);
  if (!context) {
    throw new Error('usePoll must be used within PollProvider');
  }
  return context;
};

export const PollProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [kickedOut, setKickedOut] = useState(false);
  
  const { socket, connected } = useSocket();
  const { timer, startTimer, stopTimer, resetTimer } = usePollTimer();
  const { 
    activePoll, 
    pollResults, 
    hasVoted, 
    votedOption,
    students,
    setActivePoll,
    setPollResults,
    setHasVoted,
    setVotedOption,
    setStudents
  } = usePollState();

  // Initialize user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('pollUser');
    const savedRole = localStorage.getItem('pollRole');
    
    if (savedUser && savedRole) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setRole(savedRole);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('pollUser');
        localStorage.removeItem('pollRole');
      }
    }
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on('registered', (data) => {
      if (data.success) {
        console.log('Registered successfully');
      }
    });

    socket.on('poll_state', (data) => {
      // Handle poll state sent to student on registration
      const { poll, hasVoted: voted, votedOption: option, kickedOut } = data;
      
      // Check if student is kicked out
      if (kickedOut) {
        setKickedOut(true);
        stopTimer();
        return;
      }
      
      if (poll) {
        setActivePoll(poll);
        setHasVoted(voted || false);
        setVotedOption(option || null);
        setPollResults(null);
        
        if (poll.remainingTime > 0) {
          startTimer(poll.remainingTime);
        }
      } else {
        setActivePoll(null);
        setHasVoted(false);
        setVotedOption(null);
      }
    });

    socket.on('poll_active', (data) => {
      // Handle poll active sent to teacher on registration
      const { poll, remainingTime } = data;
      if (poll) {
        setActivePoll(poll);
        if (remainingTime > 0) {
          startTimer(remainingTime);
        }
      }
    });

    socket.on('poll_started', (data) => {
      const { poll, remainingTime } = data;
      setActivePoll(poll);
      setHasVoted(false);
      setVotedOption(null);
      setPollResults(null);
      
      if (remainingTime > 0) {
        startTimer(remainingTime);
      }
      
      if (role === 'student') {
        toast.success('New question available!');
      }
    });

    socket.on('poll_completed', (data) => {
      const { pollId, results, totalVotes } = data;
      stopTimer();
      setPollResults({ results, totalVotes });
      
      if (activePoll && activePoll._id === pollId) {
        setActivePoll({ ...activePoll, status: 'completed' });
      }
    });

    socket.on('vote_submitted', (data) => {
      if (data.success) {
        setHasVoted(true);
        setVotedOption(data.vote?.optionIndex);
        // Student should see results immediately after voting
        if (role === 'student') {
          toast.success('Vote submitted successfully!');
        }
      }
    });

    socket.on('poll_results_updated', (data) => {
      const { results, totalVotes } = data;
      setPollResults({ results, totalVotes });
    });

    socket.on('timer_update', (data) => {
      const { remainingTime } = data;
      if (remainingTime >= 0) {
        startTimer(remainingTime);
      } else {
        stopTimer();
      }
    });

    socket.on('kicked_out', () => {
      setKickedOut(true);
      stopTimer();
      toast.error('You have been removed from the poll');
    });

    socket.on('students_list', (data) => {
      setStudents(data.students || []);
    });

    socket.on('all_students_answered', () => {
      if (role === 'teacher') {
        toast.success('All students have answered!');
      }
    });

    socket.on('error', (data) => {
      toast.error(data.message || 'An error occurred');
    });

    return () => {
      socket.off('registered');
      socket.off('poll_state');
      socket.off('poll_active');
      socket.off('poll_started');
      socket.off('poll_completed');
      socket.off('vote_submitted');
      socket.off('poll_results_updated');
      socket.off('timer_update');
      socket.off('kicked_out');
      socket.off('students_list');
      socket.off('all_students_answered');
      socket.off('error');
    };
  }, [socket, role, activePoll, startTimer, stopTimer, setActivePoll, setPollResults, setHasVoted, setVotedOption, setStudents]);

  // Register user with socket when connected
  useEffect(() => {
    if (socket && connected && user && role) {
      socket.emit('register', {
        userId: user.userId,
        name: user.name,
        role
      });
    }
  }, [socket, connected, user, role]);

  // Request state recovery on mount
  useEffect(() => {
    if (socket && connected && user) {
      socket.emit('get_state');
    }
  }, [socket, connected, user]);

  const registerUser = (name, userRole) => {
    const userId = user?.userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userData = {
      userId,
      name: name.trim(),
      role: userRole
    };
    
    setUser(userData);
    setRole(userRole);
    localStorage.setItem('pollUser', JSON.stringify(userData));
    localStorage.setItem('pollRole', userRole);
  };

  const createPoll = (question, options, duration) => {
    if (!socket) {
      toast.error('Not connected to server');
      return;
    }
    socket.emit('create_poll', { question, options, duration });
  };

  const startPoll = (pollId) => {
    if (!socket) {
      toast.error('Not connected to server');
      return;
    }
    socket.emit('start_poll', { pollId });
  };

  const submitVote = (pollId, optionIndex) => {
    if (!socket || !user) {
      toast.error('Not connected or user not found');
      return;
    }
    
    if (hasVoted) {
      toast.error('You have already voted');
      return;
    }

    socket.emit('submit_vote', {
      pollId,
      optionIndex
    });
  };

  const kickStudent = (studentId) => {
    if (!socket) {
      toast.error('Not connected to server');
      return;
    }
    socket.emit('kick_student', { studentId });
  };

  const resetUser = useCallback(() => {
    setUser(null);
    setRole(null);
    setKickedOut(false);
    setActivePoll(null);
    setPollResults(null);
    setHasVoted(false);
    setVotedOption(null);
    setStudents([]);
    stopTimer();
    localStorage.removeItem('pollUser');
    localStorage.removeItem('pollRole');
  }, [stopTimer]);

  const value = {
    user,
    role,
    kickedOut,
    socket,
    connected,
    timer,
    activePoll,
    pollResults,
    hasVoted,
    votedOption,
    students,
    registerUser,
    createPoll,
    startPoll,
    submitVote,
    kickStudent,
    resetUser,
    setHasVoted,
    setVotedOption,
    setActivePoll
  };

  return (
    <PollContext.Provider value={value}>
      {children}
    </PollContext.Provider>
  );
};

