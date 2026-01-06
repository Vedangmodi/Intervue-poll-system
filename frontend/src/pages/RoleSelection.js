import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../contexts/PollContext';
import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { resetUser } = usePoll();

  React.useEffect(() => {
    // Reset user state when component mounts (role selection page)
    resetUser();
  }, [resetUser]); // Now safe because resetUser is memoized with useCallback

  const handleRoleSelect = (role) => {
    if (role === 'student') {
      navigate('/student/name');
    } else {
      navigate('/teacher/dashboard');
    }
  };

  return (
    <div className="role-selection">
      <div className="role-selection-container">
        <h1 className="role-selection-title">Welcome to the Live Polling System</h1>
        <p className="role-selection-subtitle">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="role-cards">
          <div className="role-card" onClick={() => handleRoleSelect('student')}>
            <div className="role-card-header">
              <h2>I'm a Student</h2>
            </div>
            <p className="role-card-description">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry
            </p>
            <button className="btn btn-primary role-card-button">Continue</button>
          </div>

          <div className="role-card" onClick={() => handleRoleSelect('teacher')}>
            <div className="role-card-header">
              <h2>I'm a Teacher</h2>
            </div>
            <p className="role-card-description">
              Submit answers and view live poll results in real-time.
            </p>
            <button className="btn btn-primary role-card-button">Continue</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;


