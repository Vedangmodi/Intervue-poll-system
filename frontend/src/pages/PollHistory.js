import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './PollHistory.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const PollHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/history`);
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load poll history';
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `${API_URL}/history`
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="poll-history">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="poll-history">
      <div className="poll-history-header">
        <h1 className="history-title">View Poll History</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/teacher/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>

      <div className="poll-history-content">
        {history.length === 0 ? (
          <div className="no-history">
            <p>No poll history available yet.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item, index) => (
              <div key={item.pollId || index} className="history-item">
                <h2 className="history-question-title">
                  Question {index + 1}
                </h2>
                <p className="history-question">{item.question}</p>
                
                <div className="history-results">
                  {item.results && item.results.length > 0 ? (
                    item.results.map((result, resultIndex) => (
                      <div key={resultIndex} className="history-result-item">
                        <div className="result-header">
                          <span className="result-option-number">
                            {result.optionIndex + 1}
                          </span>
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
                    ))
                  ) : (
                    <p className="no-results">No results available</p>
                  )}
                </div>

                {item.totalVotes !== undefined && (
                  <p className="history-total-votes">
                    Total Votes: {item.totalVotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PollHistory;


