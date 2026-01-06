import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const usePollState = () => {
  const [activePoll, setActivePoll] = useState(null);
  const [pollResults, setPollResults] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOption, setVotedOption] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Recover state from server
  const recoverState = async (userId) => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/polls/state`, {
        params: { userId }
      });

      const { poll, hasVoted: voted, votedOption: option, kickedOut } = response.data;

      if (kickedOut) {
        return { kickedOut: true };
      }

      if (poll) {
        setActivePoll(poll);
        setHasVoted(voted);
        setVotedOption(option);
      }

      return { poll, hasVoted: voted, votedOption: option };
    } catch (error) {
      console.error('Error recovering state:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    activePoll,
    pollResults,
    hasVoted,
    votedOption,
    students,
    loading,
    setActivePoll,
    setPollResults,
    setHasVoted,
    setVotedOption,
    setStudents,
    recoverState
  };
};


