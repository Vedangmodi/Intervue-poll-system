import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../contexts/PollContext';
import toast from 'react-hot-toast';
import './StudentNameEntry.css';

const StudentNameEntry = () => {
  const navigate = useNavigate();
  const { registerUser } = usePoll();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    setLoading(true);
    try {
      registerUser(name.trim(), 'student');
      toast.success('Welcome!');
      navigate('/student/dashboard');
    } catch (error) {
      toast.error('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-name-entry">
      <div className="student-name-entry-container">
        <h1 className="student-name-entry-title">Let's Get Started</h1>
        <p className="student-name-entry-subtitle">
          If you're a student, you'll be able to submit your answers, participate in live polls, 
          and see how your responses compare with your classmates
        </p>

        <form onSubmit={handleSubmit} className="student-name-entry-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Enter your Name</label>
            <input
              id="name"
              type="text"
              className="input form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Bajaj"
              maxLength={100}
              disabled={loading}
              autoFocus
            />
            <div className="char-count">{name.length}/100</div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary form-submit"
            disabled={loading || !name.trim()}
          >
            {loading ? 'Loading...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentNameEntry;


