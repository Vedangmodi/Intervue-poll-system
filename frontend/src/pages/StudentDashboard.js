import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../contexts/PollContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './StudentDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { 
    user, 
    activePoll, 
    pollResults, 
    hasVoted, 
    votedOption,
    submitVote,
    kickedOut,
    timer: contextTimer,
    connected,
    setActivePoll
  } = usePoll();
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(true);

  // Redirect if not registered
  useEffect(() => {
    if (!user) {
      navigate('/student/name');
    }
  }, [user, navigate]);

  // Redirect if kicked out
  useEffect(() => {
    if (kickedOut) {
      navigate('/kicked-out');
    }
  }, [kickedOut, navigate]);

  // Recover state on mount
  useEffect(() => {
    const recoverState = async () => {
      if (!user) return;

      try {
        setRecovering(true);
        const response = await axios.get(`${API_URL}/polls/state`, {
          params: { userId: user.userId }
        });

        if (response.data.kickedOut) {
          navigate('/kicked-out');
          return;
        }

        if (response.data.poll) {
          // Set active poll from recovery
          setActivePoll(response.data.poll);
        } else {
          setActivePoll(null);
        }

        if (response.data.hasVoted && response.data.poll) {
          // Fetch results if already voted
          try {
            const resultsResponse = await axios.get(`${API_URL}/polls/${response.data.poll._id}/results`);
            // Results will be set via socket events
          } catch (error) {
            console.error('Error fetching results:', error);
          }
        }
      } catch (error) {
        console.error('Error recovering state:', error);
        toast.error('Failed to recover state');
      } finally {
        setRecovering(false);
      }
    };

    if (user && connected) {
      recoverState();
    }
  }, [user, connected, navigate]);

  // Handle vote submission
  const handleVote = async () => {
    if (!activePoll || selectedOption === null || hasVoted) {
      return;
    }

    setLoading(true);
    try {
      submitVote(activePoll._id, selectedOption);
      setSelectedOption(null);
      toast.success('Vote submitted!');
    } catch (error) {
      toast.error('Failed to submit vote');
    } finally {
      setLoading(false);
    }
  };

  // Display results if poll is completed or user has voted
  const showResults = pollResults || (hasVoted && (activePoll?.status === 'completed' || contextTimer === 0));

  if (recovering) {
    return (
      <div className="student-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="student-dashboard-container">
        {!activePoll ? (
          <div className="waiting-screen">
            <h1 className="waiting-title">Wait for the teacher to ask questions..</h1>
          </div>
        ) : showResults ? (
          <div className="results-screen">
            <h1 className="results-title">Question {activePoll._id ? '1' : ''}</h1>
            <h2 className="results-question">{activePoll.question}</h2>
            
            <div className="results-list">
              {pollResults?.results?.map((result, index) => (
                <div 
                  key={index} 
                  className={`result-item ${votedOption === result.optionIndex ? 'voted' : ''}`}
                >
                  <div className="result-header">
                    <span className="result-option-number">{result.optionIndex + 1}</span>
                    <span className="result-option-text">{result.text}</span>
                    <span className="result-percentage">{result.percentage}%</span>
                  </div>
                  <div className="result-bar-container">
                    <div 
                      className="result-bar" 
                      style={{ width: `${result.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <p className="waiting-message">Wait for the teacher to ask a new question..</p>
          </div>
        ) : (
          <div className="question-screen">
            <div className="question-header">
              <h1 className="question-number">Question 1</h1>
              <div className="timer-display">
                {formatTime(contextTimer || 0)}
              </div>
            </div>

            <h2 className="question-text">{activePoll.question}</h2>

            <div className="options-list">
              {activePoll.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${selectedOption === index ? 'selected' : ''}`}
                  onClick={() => !hasVoted && setSelectedOption(index)}
                  disabled={hasVoted || contextTimer === 0}
                >
                  <span className="option-number">{index + 1}.</span>
                  <span className="option-text">{option.text}</span>
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary submit-button"
              onClick={handleVote}
              disabled={selectedOption === null || hasVoted || contextTimer === 0 || loading}
            >
              {hasVoted ? 'Already Voted' : 'Submit'}
            </button>

            {contextTimer === 0 && !hasVoted && (
              <p className="time-up-message">Time's up! Results will be shown shortly.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

