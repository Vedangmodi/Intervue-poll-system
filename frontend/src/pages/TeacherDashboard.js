import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../contexts/PollContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './TeacherDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const {
    user,
    activePoll,
    pollResults,
    students,
    startPoll,
    kickStudent,
    connected,
    registerUser,
    socket,
    timer: contextTimer
  } = usePoll();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctAnswers, setCorrectAnswers] = useState([null, null]); // Track correct answer for each option (true/false/null)
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [createdPoll, setCreatedPoll] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Register as teacher on mount if not registered
  useEffect(() => {
    if (!user && connected) {
      registerUser('Teacher', 'teacher');
    }
  }, [user, connected, registerUser]);

  // Redirect if not teacher (after registration attempt)
  useEffect(() => {
    if (user && user.role !== 'teacher') {
      navigate('/');
    }
  }, [user, navigate]);

  // Auto-show create poll form when teacher first arrives (no active poll)
  useEffect(() => {
    if (user && user.role === 'teacher' && !activePoll && !showCreatePoll && !createdPoll) {
      setShowCreatePoll(true);
    }
  }, [user, activePoll, showCreatePoll, createdPoll]);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
      setCorrectAnswers([...correctAnswers, null]);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
      setCorrectAnswers(correctAnswers.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCorrectAnswerChange = (index, value) => {
    const newCorrectAnswers = [...correctAnswers];
    newCorrectAnswers[index] = value === 'yes' ? true : value === 'no' ? false : null;
    setCorrectAnswers(newCorrectAnswers);
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (options.filter(opt => opt.trim()).length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    setLoading(true);
    try {
      const validOptions = options.filter(opt => opt.trim());
      
      console.log('Creating poll with:', {
        url: `${API_URL}/polls`,
        question: question.trim(),
        options: validOptions,
        duration: parseInt(duration)
      });
      
      // Create poll via API
      const response = await axios.post(`${API_URL}/polls`, {
        question: question.trim(),
        options: validOptions,
        duration: parseInt(duration)
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('Poll created successfully:', response.data);
      setCreatedPoll(response.data);
      setShowCreatePoll(false);
      toast.success('Poll created successfully!');
    } catch (error) {
      console.error('Error creating poll:', error);
      console.error('Full error object:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: `${API_URL}/polls`,
        config: error.config
      });
      
      let errorMessage = 'Failed to create poll';
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        const backendUrl = API_URL.replace('/api', '');
        errorMessage = `Cannot connect to backend at ${backendUrl}. Make sure backend is running: cd backend && npm run dev`;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPoll = async () => {
    if (!createdPoll && !activePoll) {
      toast.error('Please create a poll first');
      return;
    }

    const pollId = createdPoll?._id || activePoll?._id;
    if (!pollId) return;

    setLoading(true);
    try {
      // Start poll via API (now triggers socket broadcast)
      const response = await axios.post(`${API_URL}/polls/${pollId}/start`);
      console.log('Poll started:', response.data);
      setCreatedPoll(null);
      toast.success('Poll started!');
      
      // Also use socket for real-time update (redundant but ensures sync)
      if (startPoll && socket && connected) {
        startPoll(pollId);
      }
    } catch (error) {
      console.error('Error starting poll:', error);
      toast.error(error.response?.data?.error || 'Failed to start poll');
    } finally {
      setLoading(false);
    }
  };

  const handleKickStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student?')) {
      return;
    }

    try {
      await axios.post(`${API_URL}/users/students/${studentId}/kick`);
      kickStudent(studentId);
      toast.success('Student removed');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove student');
    }
  };

  const canStartNewPoll = !activePoll || (pollResults && activePoll.status === 'completed');

  const toggleSupportPanel = () => {
    if (showChat || showParticipants) {
      setShowChat(false);
      setShowParticipants(false);
    } else {
      // Default to chat tab open
      setShowChat(true);
      setShowParticipants(false);
    }
  };

  return (
    <div className="teacher-dashboard">
      <div className="teacher-dashboard-header">
        <h1 className="logo">Intervue Poll</h1>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/teacher/history')}
          >
            View Poll History
          </button>
        </div>
      </div>

      <div className="teacher-dashboard-content">
        {!activePoll && !showCreatePoll && (
          <div className="welcome-screen">
            <h2>Let's Get Started</h2>
            <p>
              You'll have the ability to create and manage polls, ask questions, 
              and monitor your students' responses in real-time.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreatePoll(true)}
            >
              Create New Poll
            </button>
          </div>
        )}

        {showCreatePoll && (
          <div className="create-poll-form">
            <h2>Let's Get Started</h2>
            <form onSubmit={handleCreatePoll}>
              <div className="form-group">
                <div className="question-header">
                  <label className="form-label">Enter your question</label>
                  <select
                    className="input timer-select"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value={30}>30 seconds</option>
                    <option value={60}>60 seconds</option>
                    <option value={90}>90 seconds</option>
                    <option value={120}>120 seconds</option>
                  </select>
                </div>
                <div className="question-input-wrapper">
                  <textarea
                    className="input question-input"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Which planet is known as the Red Planet?"
                    maxLength={100}
                    rows={3}
                  />
                  <div className="char-count">{question.length}/100</div>
                </div>
              </div>

              <div className="form-group">
                <div className="options-header">
                  <label className="form-label">Edit Options</label>
                  <label className="form-label">Is it Correct?</label>
                </div>
                {options.map((option, index) => (
                  <div key={index} className="option-row">
                    <div className="option-number">{index + 1}</div>
                    <div className="option-input-wrapper">
                      <input
                        type="text"
                        className="input option-input"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        maxLength={50}
                      />
                    </div>
                    <div className="correct-answer-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          value="yes"
                          checked={correctAnswers[index] === true}
                          onChange={(e) => handleCorrectAnswerChange(index, e.target.value)}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          value="no"
                          checked={correctAnswers[index] === false}
                          onChange={(e) => handleCorrectAnswerChange(index, e.target.value)}
                        />
                        <span>No</span>
                      </label>
                    </div>
                    {options.length > 2 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => handleRemoveOption(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {options.length < 10 && (
                  <button
                    type="button"
                    className="btn btn-secondary add-option-btn"
                    onClick={handleAddOption}
                  >
                    + Add More option
                  </button>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreatePoll(false);
                    setQuestion('');
                    setOptions(['', '']);
                    setCorrectAnswers([null, null]);
                    setCreatedPoll(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Ask Question'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activePoll && (
          <div className="active-poll-view">
            <div className="poll-main-container">
              {/* Left side - Question and Options */}
              <div className="poll-question-section">
                <div className="poll-header">
                  <h2 className="poll-question">{activePoll.question}</h2>
                  <div className="poll-timer">Timer: {formatTime(contextTimer || 0)}</div>
                </div>

                {/* Action Button - align bottom right like Figma */}
                <div className="poll-actions-bar">
                  {canStartNewPoll && (
                    <button
                      className="btn btn-primary ask-new-question-btn"
                      onClick={() => setShowCreatePoll(true)}
                    >
                      + Ask a new question
                    </button>
                  )}
                </div>

                {/* Results Section */}
                <div className="poll-results">
                  <div className="results-list">
                    {(pollResults?.results || activePoll.options.map((opt, idx) => ({
                      optionIndex: idx,
                      text: opt.text,
                      percentage: 0
                    }))).map((result, index) => (
                      <div key={index} className="result-item">
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
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Floating chat/participants panel trigger */}
        {activePoll && (
          <>
            <button
              className="floating-chat-button"
              type="button"
              onClick={toggleSupportPanel}
            >
              <span className="floating-chat-icon">Chat</span>
            </button>

            {(showChat || showParticipants) && (
              <div className="floating-support-panel">
                <div className="poll-sidebar">
                  <div className="sidebar-tabs">
                    <button
                      className={`sidebar-tab ${showChat ? 'active' : ''}`}
                      onClick={() => {
                        setShowChat(true);
                        setShowParticipants(false);
                      }}
                    >
                      Chat
                    </button>
                    <button
                      className={`sidebar-tab ${showParticipants ? 'active' : ''}`}
                      onClick={() => {
                        setShowParticipants(true);
                        setShowChat(false);
                      }}
                    >
                      Participants ({students.length})
                    </button>
                  </div>

                  <div className="sidebar-content">
                    {showChat ? (
                      <div className="chat-panel">
                        <h3>Chat</h3>
                        <p className="chat-placeholder">Chat feature coming soon...</p>
                      </div>
                    ) : showParticipants ? (
                      <div className="participants-panel">
                        <h3>Participants</h3>
                        <table className="participants-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.length === 0 ? (
                              <tr>
                                <td colSpan="2" className="no-participants">No participants yet</td>
                              </tr>
                            ) : (
                              students.map((student) => (
                                <tr key={student.userId}>
                                  <td>{student.name}</td>
                                  <td>
                                    <button
                                      className="btn-kick"
                                      onClick={() => handleKickStudent(student.userId)}
                                    >
                                      Kick out
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                        {pollResults && (
                          <p className="participants-summary">
                            {pollResults.totalVotes} of {students.length} students have voted
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {createdPoll && !activePoll && (
          <div className="created-poll-preview">
            <h3>Poll Created</h3>
            <p><strong>Question:</strong> {createdPoll.question}</p>
            <p><strong>Options:</strong> {createdPoll.options.length}</p>
            <p><strong>Duration:</strong> {createdPoll.duration} seconds</p>
            <button
              className="btn btn-primary"
              onClick={handleStartPoll}
              disabled={loading}
            >
              {loading ? 'Starting...' : 'Start Poll'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

