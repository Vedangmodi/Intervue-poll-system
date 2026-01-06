import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../contexts/PollContext';
import './KickedOut.css';

const KickedOut = () => {
  const navigate = useNavigate();
  const { resetUser } = usePoll();

  const handleTryAgain = () => {
    resetUser();
    navigate('/');
  };

  return (
    <div className="kicked-out">
      <div className="kicked-out-container">
        {/* <div className="kicked-out-icon">🚫</div> */}
        <h1 className="logo">Intervue Poll</h1>
        <h1 className="kicked-out-title">You've been Kicked out!</h1>
        <p className="kicked-out-message">
          Looks like the teacher had removed you from the poll system. Please Try again sometime.
        </p>
      </div>
    </div>
  );
};

export default KickedOut;


