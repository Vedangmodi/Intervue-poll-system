import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PollProvider } from './contexts/PollContext';
import RoleSelection from './pages/RoleSelection';
import StudentNameEntry from './pages/StudentNameEntry';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import PollHistory from './pages/PollHistory';
import KickedOut from './pages/KickedOut';
import './App.css';

function App() {
  return (
    <PollProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<RoleSelection />} />
            <Route path="/student/name" element={<StudentNameEntry />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/history" element={<PollHistory />} />
            <Route path="/kicked-out" element={<KickedOut />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </PollProvider>
  );
}

export default App;


